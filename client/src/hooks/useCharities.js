import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCharity,
  deleteCharity,
  getCharities,
  getMyDonations,
  makeDonation,
  selectCharity,
  updateCharity,
  updateCharityPercentage,
} from "../services/charity";

export function useCharities(params = {}) {
  return useQuery({
    queryKey: ["charities", params],
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
        queryClient.invalidateQueries({ queryKey: ["user"] }),
        queryClient.invalidateQueries({ queryKey: ["charities"] }),
      ]);
    },
  });
}

// NEW: Update user's charity contribution percentage
export function useUpdateCharityPercentage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (percentage) => {
      const response = await updateCharityPercentage(percentage);
      return response.data.data;
    },
    onSuccess: async () => {
      // Refresh subscription data so charityPercentage reflects the update
      await queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}

// NEW: Make an independent one-time donation
export function useMakeDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ charityId, amount }) => {
      const response = await makeDonation(charityId, amount);
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["charities"] }),
        queryClient.invalidateQueries({ queryKey: ["myDonations"] }),
      ]);
    },
  });
}

// NEW: Get user's own donation history
export function useMyDonations(options = {}) {
  return useQuery({
    queryKey: ["myDonations"],
    queryFn: async () => {
      const response = await getMyDonations();
      return response.data.data;
    },
    retry: false,
    ...options,
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
      await queryClient.invalidateQueries({ queryKey: ["charities"] });
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
      await queryClient.invalidateQueries({ queryKey: ["charities"] });
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
      await queryClient.invalidateQueries({ queryKey: ["charities"] });
    },
  });
}
