import { api } from './api';

export async function addScore(payload) {
  return api.post('/score/add', payload);
}

export async function getScores() {
  return api.get('/score');
}

export async function editScore(index, payload) {
  return api.put(`/score/${index}`, payload);
}
