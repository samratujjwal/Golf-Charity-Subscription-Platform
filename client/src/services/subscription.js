import { subscriptionApi } from './api';

export async function createCheckoutSession(plan) {
  return subscriptionApi.createCheckoutSession({ plan });
}

export async function getCurrentSubscription(sessionId = null) {
  return subscriptionApi.current({ params: sessionId ? { session_id: sessionId } : {} });
}
