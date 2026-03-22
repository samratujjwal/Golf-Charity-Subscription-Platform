import { api } from "./api";

export async function getCharities(params = {}) {
  return api.get("/charity", { params });
}

export async function getCharityById(charityId) {
  return api.get(`/charity/${charityId}`);
}

export async function selectCharity(charityId) {
  return api.post("/charity/select", { charityId });
}

// NEW: Update user's charity contribution percentage (min 10, max 100)
export async function updateCharityPercentage(percentage) {
  return api.patch("/charity/percentage", { percentage });
}

// NEW: Make an independent one-time donation
export async function makeDonation(charityId, amount) {
  return api.post("/charity/donate", { charityId, amount });
}

// NEW: Get user's own donation history
export async function getMyDonations() {
  return api.get("/charity/donations/me");
}

export async function createCharity(payload) {
  return api.post("/admin/charity", payload);
}

export async function updateCharity(charityId, payload) {
  return api.put(`/admin/charity/${charityId}`, payload);
}

export async function deleteCharity(charityId) {
  return api.delete(`/admin/charity/${charityId}`);
}
