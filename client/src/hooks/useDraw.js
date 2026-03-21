import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDraw, getLatestDraw, runDraw, simulateDraw } from '../services/draw';

export function useLatestDraw(options = {}) {
  return useQuery({
    queryKey: ['draw', 'latest'],
    queryFn: async () => {
      const response = await getLatestDraw();
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function useCreateDraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDraw,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['draw', 'latest'] });
    },
  });
}

export function useSimulateDraw() {
  return useMutation({
    mutationFn: simulateDraw,
  });
}

export function useRunDraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runDraw,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['draw', 'latest'] }),
        queryClient.invalidateQueries({ queryKey: ['user'] }),
      ]);
    },
  });
}
