import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  calculatePrizePool,
  distributePrizes,
  getAdminWinnings,
  getMyWinnings,
  payWinning,
  uploadWinningProof,
  verifyWinning,
} from '../services/winnings';

export function useMyWinnings(options = {}) {
  return useQuery({
    queryKey: ['winnings', 'me'],
    queryFn: async () => {
      const response = await getMyWinnings();
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function useAdminWinnings(params = {}, options = {}) {
  return useQuery({
    queryKey: ['admin-winnings', params],
    queryFn: async () => {
      const response = await getAdminWinnings(params);
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function usePrizePool(drawId, options = {}) {
  return useQuery({
    queryKey: ['winnings', 'pool', drawId],
    queryFn: async () => {
      const response = await calculatePrizePool(drawId);
      return response.data.data;
    },
    enabled: Boolean(drawId),
    retry: false,
    ...options,
  });
}

export function useUploadWinningProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadWinningProof,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['winnings', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['draw', 'latest'] }),
      ]);
    },
  });
}

export function useDistributePrizes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: distributePrizes,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-winnings'] }),
        queryClient.invalidateQueries({ queryKey: ['winnings', 'pool'] }),
        queryClient.invalidateQueries({ queryKey: ['winnings', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['draw', 'latest'] }),
      ]);
    },
  });
}

export function useVerifyWinning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyWinning,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-winnings'] }),
        queryClient.invalidateQueries({ queryKey: ['winnings', 'me'] }),
      ]);
    },
  });
}

export function usePayWinning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payWinning,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-winnings'] }),
        queryClient.invalidateQueries({ queryKey: ['winnings', 'me'] }),
      ]);
    },
  });
}
