import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useEffect, useState } from 'react';
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshToken as refreshTokenRequest,
  register as registerRequest,
} from '../services/auth';
import { setupAuthInterceptors } from '../services/api';
import { clearAccessToken, setAccessToken } from '../utils/authStore';

export const AuthContext = createContext(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function AppProviders({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
    };

    const detachInterceptors = setupAuthInterceptors({
      onUnauthorized: handleUnauthorized,
      refreshToken: async () => {
        const response = await refreshTokenRequest();
        const nextToken = response.data.data.accessToken;
        setAccessToken(nextToken);
        return nextToken;
      },
    });

    return () => {
      detachInterceptors();
    };
  }, []);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const refreshResponse = await refreshTokenRequest();
        const nextToken = refreshResponse.data.data.accessToken;

        setAccessToken(nextToken);

        const profileResponse = await getCurrentUser();
        setUser(profileResponse.data.data);
        setIsAuthenticated(true);
      } catch (error) {
        clearAccessToken();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    };

    bootstrapSession();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isInitializing,
    async register(payload) {
      return registerRequest(payload);
    },
    async login(payload) {
      const response = await loginRequest(payload);
      const data = response.data.data;

      setAccessToken(data.accessToken);
      setUser(data.user);
      setIsAuthenticated(true);
      await queryClient.invalidateQueries();

      return response;
    },
    async logout() {
      try {
        await logoutRequest();
      } finally {
        clearAccessToken();
        setUser(null);
        setIsAuthenticated(false);
        queryClient.clear();
      }
    },
    async refetchUser() {
      const response = await getCurrentUser();
      setUser(response.data.data);
      setIsAuthenticated(true);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      return response;
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}
