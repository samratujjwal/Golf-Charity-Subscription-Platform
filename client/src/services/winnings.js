import { api } from "./api";

export function getMyWinnings() {
  return api.get("/winnings/me");
}

export function uploadWinningProof(payload) {
  return api.post("/winnings/upload-proof", payload);
}

export function getAdminWinnings(params = {}) {
  return api.get("/admin/winnings", { params });
}

export function calculatePrizePool(drawId) {
  return api.get(`/admin/winnings/draw/${drawId}/pool`);
}

export function distributePrizes(drawId) {
  return api.post(`/admin/winnings/draw/${drawId}/distribute`);
}

export function verifyWinning(winningId) {
  return api.put(`/admin/winning/${winningId}/verify`);
}

// NEW: Reject a winning — admin found proof invalid
export function rejectWinning(winningId) {
  return api.put(`/admin/winning/${winningId}/reject`);
}

export function payWinning(winningId) {
  return api.put(`/admin/winning/${winningId}/pay`);
}
