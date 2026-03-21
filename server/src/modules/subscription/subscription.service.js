import mongoose from 'mongoose';
import { getStripeClient } from '../../config/stripe.js';
import { ApiError } from '../../utils/ApiError.js';

const PLAN_KEYS = ['monthly', 'yearly'];

export class StripeSubscriptionService {
  constructor(subscriptionRepository) {
    this.subscriptionRepository = subscriptionRepository;
  }

  async createCheckoutSession({ userId, plan }) {
    this.validateObjectId(userId, 'Invalid user id');
    this.validatePlan(plan);

    const user = await this.subscriptionRepository.findUserById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.charityId) {
      throw new ApiError(400, 'Please select a charity before starting a subscription');
    }

    const existingActiveSubscription = await this.subscriptionRepository.findActiveSubscriptionByUserId(userId);

    if (existingActiveSubscription && new Date(existingActiveSubscription.endDate) > new Date()) {
      throw new ApiError(409, 'User already has an active subscription');
    }

    const priceId = this.getPriceIdForPlan(plan);
    const clientUrl = process.env.CLIENT_URL;

    if (!clientUrl) {
      throw new ApiError(500, 'CLIENT_URL is not configured');
    }

    const session = await this.getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cancel`,
      customer_email: user.email,
      client_reference_id: userId,
      metadata: {
        userId,
        plan,
        priceId,
        charityId: user.charityId.toString(),
      },
    });

    return { url: session.url };
  }

  async getCurrentSubscription(userId, sessionId = null) {
    this.validateObjectId(userId, 'Invalid user id');

    if (sessionId) {
      await this.syncSubscriptionFromCheckoutSession({ userId, sessionId });
    }

    const subscription = await this.subscriptionRepository.findActiveSubscriptionByUserId(userId);

    if (!subscription) {
      return null;
    }

    return this.sanitizeSubscription(subscription);
  }

  async syncSubscriptionFromCheckoutSession({ userId, sessionId }) {
    if (!sessionId || typeof sessionId !== 'string') {
      return null;
    }

    const session = await this.getStripe().checkout.sessions.retrieve(sessionId);

    if (!session?.subscription) {
      return null;
    }

    if (session.mode !== 'subscription') {
      return null;
    }

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return null;
    }

    const stripeSubscription = await this.fetchStripeSubscription(session.subscription);
    const user = await this.resolveUser({
      userId: userId || session.client_reference_id || session.metadata?.userId,
      email: session.customer_email,
    });

    return this.syncSubscriptionRecord({
      user,
      stripeSubscription,
      fallbackPlan: session.metadata?.plan,
      fallbackPriceId: session.metadata?.priceId,
      status: 'active',
    });
  }

  async handleWebhook({ signature, rawBody }) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new ApiError(500, 'STRIPE_WEBHOOK_SECRET is not configured');
    }

    if (!signature) {
      throw new ApiError(400, 'Stripe signature is missing');
    }

    const event = this.getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      default:
        break;
    }

    return { received: true, eventType: event.type };
  }

  async handleCheckoutCompleted(session) {
    if (!session.subscription) {
      return;
    }

    const stripeSubscription = await this.fetchStripeSubscription(session.subscription);
    const user = await this.resolveUser({
      userId: session.client_reference_id || session.metadata?.userId,
      email: session.customer_email,
    });

    await this.syncSubscriptionRecord({
      user,
      stripeSubscription,
      fallbackPlan: session.metadata?.plan,
      fallbackPriceId: session.metadata?.priceId,
      status: 'active',
    });
  }

  async handleInvoicePaymentSucceeded(invoice) {
    if (!invoice.subscription) {
      return;
    }

    const existingPayment = await this.subscriptionRepository.findPaymentByTransactionId(
      invoice.payment_intent || invoice.id,
    );

    const stripeSubscription = await this.fetchStripeSubscription(invoice.subscription);
    const user = await this.resolveUserFromStripeSubscription(stripeSubscription);
    const subscriptionRecord = await this.syncSubscriptionRecord({
      user,
      stripeSubscription,
      fallbackPriceId: invoice.lines?.data?.[0]?.price?.id,
      status: 'active',
    });

    await this.subscriptionRepository.upsertPaymentByTransactionId(
      invoice.payment_intent || invoice.id,
      {
        userId: user._id,
        subscriptionId: subscriptionRecord._id,
        amount: (invoice.amount_paid || 0) / 100,
        currency: (invoice.currency || 'usd').toUpperCase(),
        status: 'success',
        paymentProvider: 'stripe',
      },
    );

    if (user.charityId && existingPayment?.status !== 'success') {
      await this.subscriptionRepository.incrementCharityDonations(
        user.charityId,
        this.calculateContribution(subscriptionRecord.amount, subscriptionRecord.charityPercentage),
      );
    }
  }

  async handleInvoicePaymentFailed(invoice) {
    if (!invoice.subscription) {
      return;
    }

    const subscriptionRecord = await this.subscriptionRepository.findSubscriptionByStripeSubscriptionId(
      invoice.subscription,
    );

    if (!subscriptionRecord) {
      return;
    }

    await this.subscriptionRepository.updateSubscriptionById(subscriptionRecord._id, {
      status: 'expired',
    });

    await this.subscriptionRepository.upsertPaymentByTransactionId(invoice.payment_intent || invoice.id, {
      userId: subscriptionRecord.userId,
      subscriptionId: subscriptionRecord._id,
      amount: (invoice.amount_due || 0) / 100,
      currency: (invoice.currency || 'usd').toUpperCase(),
      status: 'failed',
      paymentProvider: 'stripe',
    });
  }

  async handleSubscriptionDeleted(subscription) {
    const subscriptionRecord = await this.subscriptionRepository.findSubscriptionByStripeSubscriptionId(
      subscription.id,
    );

    if (!subscriptionRecord) {
      return;
    }

    await this.subscriptionRepository.updateSubscriptionById(subscriptionRecord._id, {
      status: 'cancelled',
      endDate: new Date((subscription.current_period_end || subscription.ended_at || Date.now() / 1000) * 1000),
    });
  }

  async syncSubscriptionRecord({ user, stripeSubscription, fallbackPlan, fallbackPriceId, status }) {
    const stripePriceId = stripeSubscription.items?.data?.[0]?.price?.id || fallbackPriceId;
    const plan = this.planFromPriceId(stripePriceId) || fallbackPlan;
    const amount = (stripeSubscription.items?.data?.[0]?.price?.unit_amount || 0) / 100;
    const existingSubscription = await this.subscriptionRepository.findSubscriptionByStripeSubscriptionId(
      stripeSubscription.id,
    );

    if (!plan) {
      throw new ApiError(500, 'Unable to determine subscription plan from Stripe data');
    }

    if (!existingSubscription && status === 'active') {
      await this.subscriptionRepository.expireOtherActiveSubscriptions(user._id.toString());
    }

    const startDate = new Date((stripeSubscription.current_period_start || Date.now() / 1000) * 1000);
    const endDate = this.calculateSubscriptionEndDate(startDate, plan);

    const subscriptionPayload = {
      userId: user._id,
      plan,
      status,
      startDate,
      endDate,
      amount,
      charityPercentage: existingSubscription?.charityPercentage || 10,
      stripeCustomerId: this.extractCustomerId(stripeSubscription.customer),
      stripePriceId,
    };

    const subscriptionRecord = await this.subscriptionRepository.upsertSubscriptionByStripeSubscriptionId(
      stripeSubscription.id,
      subscriptionPayload,
    );

    if (status === 'active') {
      await this.subscriptionRepository.expireOtherActiveSubscriptions(
        user._id.toString(),
        subscriptionRecord._id.toString(),
      );
    }

    return subscriptionRecord;
  }

  async fetchStripeSubscription(subscriptionId) {
    const normalizedSubscriptionId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id;

    if (!normalizedSubscriptionId) {
      throw new ApiError(400, 'Stripe subscription id is missing');
    }

    return this.getStripe().subscriptions.retrieve(normalizedSubscriptionId, {
      expand: ['customer', 'items.data.price'],
    });
  }

  async resolveUser({ userId, email }) {
    let user = null;

    if (userId && mongoose.isValidObjectId(userId)) {
      user = await this.subscriptionRepository.findUserById(userId);
    }

    if (!user && email) {
      user = await this.subscriptionRepository.findUserByEmail(email.toLowerCase());
    }

    if (!user) {
      throw new ApiError(404, 'Unable to resolve user for subscription event');
    }

    return user;
  }

  async resolveUserFromStripeSubscription(stripeSubscription) {
    const customer = stripeSubscription.customer;
    const email = typeof customer === 'object' ? customer.email : null;
    const user = await this.resolveUser({ userId: null, email });
    return user;
  }

  getPriceIdForPlan(plan) {
    const config = {
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_YEARLY_PRICE_ID,
    };

    const priceId = config[plan];

    if (!priceId) {
      throw new ApiError(500, `Stripe price id for ${plan} plan is not configured`);
    }

    return priceId;
  }

  planFromPriceId(priceId) {
    const map = {
      [process.env.STRIPE_MONTHLY_PRICE_ID]: 'monthly',
      [process.env.STRIPE_YEARLY_PRICE_ID]: 'yearly',
    };

    return map[priceId] || null;
  }

  calculateContribution(amount, charityPercentage) {
    return Number(((amount * charityPercentage) / 100).toFixed(2));
  }

  calculateSubscriptionEndDate(startDate, plan) {
    const endDate = new Date(startDate);

    if (plan === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
      return endDate;
    }

    endDate.setMonth(endDate.getMonth() + 1);
    return endDate;
  }

  extractCustomerId(customer) {
    if (!customer) {
      return null;
    }

    return typeof customer === 'string' ? customer : customer.id;
  }

  validatePlan(plan) {
    if (!PLAN_KEYS.includes(plan)) {
      throw new ApiError(400, 'Plan must be either monthly or yearly');
    }
  }

  validateObjectId(value, message) {
    if (!mongoose.isValidObjectId(value)) {
      throw new ApiError(400, message);
    }
  }

  sanitizeSubscription(subscription) {
    return {
      id: subscription._id.toString(),
      userId: subscription.userId.toString(),
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      amount: subscription.amount,
      charityPercentage: subscription.charityPercentage,
      stripePriceId: subscription.stripePriceId,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  getStripe() {
    return getStripeClient();
  }
}

