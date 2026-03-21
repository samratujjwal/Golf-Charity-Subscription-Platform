import { useQuery } from '@tanstack/react-query';
import { getCurrentSubscription } from '../services/subscription';

export function useSubscription(options = {}) {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await getCurrentSubscription();
      return response.data.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
    ...options,
  });
}
