import { authApi } from './api';

export async function register(payload) {
  return authApi.register(payload);
}

export async function login(payload) {
  return authApi.login(payload);
}

export async function logout() {
  return authApi.logout();
}

export async function refreshToken() {
  return authApi.refresh();
}

export async function getCurrentUser() {
  return authApi.me();
}
