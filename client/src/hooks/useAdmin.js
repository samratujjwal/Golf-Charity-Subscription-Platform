import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCharity,
  createAdminDraw,
  deleteAdminCharity,
  distributeAdminPrizes,
  getAdminAnalytics,
  getAdminCharities,
  getAdminDashboard,
  getAdminDrawConfig,
  getAdminDraws,
  getAdminPrizePool,
  getAdminSubscriptions,
  getAdminUsers,
  getAdminWinnings,
  payAdminWinning,
  publishAdminDraw,
  rejectAdminWinning,
  runAdminDraw,
  simulateAdminDraw,
  updateAdminCharity,
  updateAdminDrawConfig,
  updateAdminSubscriptionStatus,
  updateAdminUser,
  updateAdminUserScores,
  updateUserBlockState,
  updateUserRole,
  verifyAdminWinning,
} from "../services/admin";

export function useAdminDashboard(options = {}) {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const response = await getAdminDashboard();
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function useAdminAnalytics(options = {}) {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const response = await getAdminAnalytics();
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function useAdminUsers(params = {}, options = {}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const response = await getAdminUsers(params);
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }) => updateAdminUser(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateAdminUserScores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, scores }) => updateAdminUserScores(userId, scores),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useToggleUserBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isBlocked }) =>
      updateUserBlockState(userId, isBlocked),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminSubscriptions(params = {}, options = {}) {
  return useQuery({
    queryKey: ["admin", "subscriptions", params],
    queryFn: async () => {
      const response = await getAdminSubscriptions(params);
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function useUpdateAdminSubscriptionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, status }) =>
      updateAdminSubscriptionStatus(subscriptionId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["subscription"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
  });
}

export function useAdminDraws(params = {}, options = {}) {
  return useQuery({
    queryKey: ["admin", "draws", params],
    queryFn: async () => {
      const response = await getAdminDraws(params);
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function useAdminDrawConfig(options = {}) {
  return useQuery({
    queryKey: ["admin", "draw-config"],
    queryFn: async () => {
      const response = await getAdminDrawConfig();
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function useUpdateAdminDrawConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type) => updateAdminDrawConfig(type),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "draw-config"],
      });
    },
  });
}

export function useCreateAdminDraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminDraw,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "draws"] }),
        queryClient.invalidateQueries({ queryKey: ["draw", "latest"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
  });
}

export function useSimulateAdminDraw() {
  return useMutation({
    mutationFn: simulateAdminDraw,
  });
}

export function useRunAdminDraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runAdminDraw,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "draws"] }),
        queryClient.invalidateQueries({ queryKey: ["draw", "latest"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-winnings"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
  });
}

export function usePublishAdminDraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishAdminDraw,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "draws"] }),
        queryClient.invalidateQueries({ queryKey: ["draw", "latest"] }),
      ]);
    },
  });
}

export function useAdminCharities(params = {}, options = {}) {
  return useQuery({
    queryKey: ["admin", "charities", params],
    queryFn: async () => {
      const response = await getAdminCharities(params);
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function useCreateAdminCharity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCharity,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "charities"] }),
        queryClient.invalidateQueries({ queryKey: ["charities"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
  });
}

export function useUpdateAdminCharity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ charityId, payload }) =>
      updateAdminCharity(charityId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "charities"] }),
        queryClient.invalidateQueries({ queryKey: ["charities"] }),
      ]);
    },
  });
}

export function useDeleteAdminCharity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminCharity,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "charities"] }),
        queryClient.invalidateQueries({ queryKey: ["charities"] }),
      ]);
    },
  });
}

export function useAdminWinnings(params = {}, options = {}) {
  return useQuery({
    queryKey: ["admin-winnings", params],
    queryFn: async () => {
      const response = await getAdminWinnings(params);
      return response.data.data;
    },
    retry: false,
    ...options,
  });
}

export function useAdminPrizePool(drawId, options = {}) {
  return useQuery({
    queryKey: ["admin", "prize-pool", drawId],
    queryFn: async () => {
      const response = await getAdminPrizePool(drawId);
      return response.data.data;
    },
    enabled: Boolean(drawId),
    retry: false,
    ...options,
  });
}

export function useDistributeAdminPrizes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: distributeAdminPrizes,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-winnings"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "prize-pool"] }),
        queryClient.invalidateQueries({ queryKey: ["winnings", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
  });
}

export function useVerifyAdminWinning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyAdminWinning,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-winnings"] }),
        queryClient.invalidateQueries({ queryKey: ["winnings", "me"] }),
      ]);
    },
  });
}

// NEW: Reject a winning — admin found proof invalid
export function useRejectAdminWinning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectAdminWinning,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-winnings"] }),
        queryClient.invalidateQueries({ queryKey: ["winnings", "me"] }),
      ]);
    },
  });
}

export function usePayAdminWinning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payAdminWinning,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-winnings"] }),
        queryClient.invalidateQueries({ queryKey: ["winnings", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
      ]);
    },
  });
}
