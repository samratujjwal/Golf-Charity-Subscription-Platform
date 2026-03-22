import { subscriptionApi } from './api';

export async function createCheckoutSession(plan) {
  return subscriptionApi.createCheckoutSession({ plan });
}

// FIX Bug 6: Pass session_id as a proper axios params config object
export async function getCurrentSubscription(sessionId = null) {
  const config = sessionId ? { params: { session_id: sessionId } } : {};
  return subscriptionApi.current(config);
}