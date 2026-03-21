import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addScore, editScore, getScores } from '../services/score';

export function useScores(options = {}) {
  return useQuery({
    queryKey: ['scores'],
    queryFn: async () => {
      const response = await getScores();
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function useAddScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await addScore(payload);
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['scores'] });
    },
  });
}

export function useEditScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ index, payload }) => {
      const response = await editScore(index, payload);
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['scores'] });
    },
  });
}
