import axios from "axios";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../utils/authStore";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const defaultConfig = {
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
};

export const api = axios.create(defaultConfig);
export const publicApi = axios.create(defaultConfig);

let responseInterceptorId = null;
let requestInterceptorId = null;
let refreshRequestPromise = null;

export function setupAuthInterceptors({ refreshToken, onUnauthorized }) {
  if (requestInterceptorId !== null) {
    api.interceptors.request.eject(requestInterceptorId);
  }

  if (responseInterceptorId !== null) {
    api.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = api.interceptors.request.use((config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  responseInterceptorId = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const statusCode = error.response?.status;
      const isRefreshEndpoint = originalRequest?.url?.includes("/auth/refresh");

      if (
        statusCode !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        isRefreshEndpoint
      ) {
        throw error;
      }

      originalRequest._retry = true;

      try {
        if (!refreshRequestPromise) {
          refreshRequestPromise = refreshToken().finally(() => {
            refreshRequestPromise = null;
          });
        }

        const nextAccessToken = await refreshRequestPromise;
        setAccessToken(nextAccessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        onUnauthorized?.();
        throw refreshError;
      }
    },
  );

  return () => {
    if (requestInterceptorId !== null) {
      api.interceptors.request.eject(requestInterceptorId);
      requestInterceptorId = null;
    }

    if (responseInterceptorId !== null) {
      api.interceptors.response.eject(responseInterceptorId);
      responseInterceptorId = null;
    }
  };
}

export const healthApi = {
  async getStatus() {
    return api.get("/health");
  },
};

export const authApi = {
  async register(payload) {
    return publicApi.post("/auth/register", payload);
  },
  async login(payload) {
    return publicApi.post("/auth/login", payload);
  },
  async logout() {
    return api.post("/auth/logout");
  },
  async refresh() {
    return publicApi.post("/auth/refresh");
  },
  async me() {
    return api.get("/auth/me");
  },
};

export const subscriptionApi = {
  async createCheckoutSession(payload) {
    return api.post("/subscription/create-checkout-session", payload);
  },
  // FIX Bug 13: accept config so callers can pass { params: { session_id } }
  async current(config = {}) {
    return api.get("/subscription/current", config);
  },
};
