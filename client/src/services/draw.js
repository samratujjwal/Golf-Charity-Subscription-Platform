import { api } from './api';

export function getLatestDraw() {
  return api.get('/draw/latest');
}

export function createDraw(payload) {
  return api.post('/draw/create', payload);
}

export function simulateDraw(payload) {
  return api.post('/draw/simulate', payload);
}

export function runDraw() {
  return api.post('/draw/run');
}
