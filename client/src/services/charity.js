import { api } from './api';

export async function getCharities(params = {}) {
  return api.get('/charity', { params });
}

export async function getCharityById(charityId) {
  return api.get(`/charity/${charityId}`);
}

export async function selectCharity(charityId) {
  return api.post('/charity/select', { charityId });
}

export async function createCharity(payload) {
  return api.post('/admin/charity', payload);
}

export async function updateCharity(charityId, payload) {
  return api.put(`/admin/charity/${charityId}`, payload);
}

export async function deleteCharity(charityId) {
  return api.delete(`/admin/charity/${charityId}`);
}
