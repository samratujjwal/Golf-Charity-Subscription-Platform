import { api } from "./api";

export function getAdminDashboard() {
  return api.get("/admin/dashboard");
}

export function getAdminAnalytics() {
  return api.get("/admin/analytics");
}

export function getAdminUsers(params = {}) {
  return api.get("/admin/users", { params });
}

export function updateAdminUser(userId, payload) {
  return api.put(`/admin/user/${userId}`, payload);
}

export function updateAdminUserScores(userId, scores) {
  return api.put(`/admin/user/${userId}/scores`, { scores });
}

export function updateUserBlockState(userId, isBlocked) {
  return api.put(`/admin/user/${userId}/block`, { isBlocked });
}

export function updateUserRole(userId, role) {
  return api.put(`/admin/user/${userId}/role`, { role });
}

export function getAdminSubscriptions(params = {}) {
  return api.get("/admin/subscriptions", { params });
}

export function updateAdminSubscriptionStatus(subscriptionId, status) {
  return api.put(`/admin/subscription/${subscriptionId}/status`, { status });
}

export function getAdminDraws(params = {}) {
  return api.get("/admin/draws", { params });
}

export function getAdminDrawConfig() {
  return api.get("/admin/draw/config");
}

export function updateAdminDrawConfig(type) {
  return api.put("/admin/draw/config", { type });
}

export function createAdminDraw(payload) {
  return api.post("/admin/draws/create", payload);
}

export function simulateAdminDraw(payload) {
  return api.post("/admin/draws/simulate", payload);
}

export function runAdminDraw() {
  return api.post("/admin/draws/run");
}

export function publishAdminDraw() {
  return api.post("/admin/draw/publish");
}

export function getAdminCharities(params = {}) {
  return api.get("/admin/charity", { params });
}

export function createAdminCharity(payload) {
  return api.post("/admin/charity", payload);
}

export function updateAdminCharity(charityId, payload) {
  return api.put(`/admin/charity/${charityId}`, payload);
}

export function deleteAdminCharity(charityId) {
  return api.delete(`/admin/charity/${charityId}`);
}

export function getAdminWinnings(params = {}) {
  return api.get("/admin/winnings", { params });
}

export function getAdminPrizePool(drawId) {
  return api.get(`/admin/winnings/draw/${drawId}/pool`);
}

export function distributeAdminPrizes(drawId) {
  return api.post(`/admin/winnings/draw/${drawId}/distribute`);
}

export function verifyAdminWinning(winningId) {
  return api.put(`/admin/winning/${winningId}/verify`);
}

// NEW: Reject a winning — admin found proof invalid
export function rejectAdminWinning(winningId) {
  return api.put(`/admin/winning/${winningId}/reject`);
}

export function payAdminWinning(winningId) {
  return api.put(`/admin/winning/${winningId}/pay`);
}
