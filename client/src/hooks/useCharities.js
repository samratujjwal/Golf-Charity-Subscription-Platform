import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCharity,
  deleteCharity,
  getCharities,
  selectCharity,
  updateCharity,
} from '../services/charity';

export function useCharities(params = {}) {
  return useQuery({
    queryKey: ['charities', params],
    queryFn: async () => {
      const response = await getCharities(params);
      return response.data.data;
    },
    retry: false,
  });
}

export function useSelectCharity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (charityId) => {
      const response = await selectCharity(charityId);
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user'] }),
        queryClient.invalidateQueries({ queryKey: ['charities'] }),
      ]);
    },
  });
}

export function useCreateCharity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await createCharity(payload);
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['charities'] });
    },
  });
}

export function useUpdateCharity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ charityId, payload }) => {
      const response = await updateCharity(charityId, payload);
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['charities'] });
    },
  });
}

export function useDeleteCharity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (charityId) => {
      const response = await deleteCharity(charityId);
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['charities'] });
    },
  });
}
