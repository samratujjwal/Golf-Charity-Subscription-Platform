import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../services/auth';

export function useUser(options = {}) {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data.data;
    },
    ...options,
  });
}
