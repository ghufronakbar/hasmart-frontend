"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sellService } from "@/services/transaction/sell.service";
import { queryKeys, invalidationMap } from "@/constants/query-keys";
import {
  CreateSellDTO,
  UpdateSellDTO,
  SellListResponse,
} from "@/types/transaction/sell";
import { FilterQuery } from "@/types/common";

// --- Sell Hooks ---

export function useSells(
  params?: FilterQuery & {
    dateStart?: string;
    dateEnd?: string;
    branchId?: number;
  },
) {
  return useQuery<SellListResponse>({
    queryKey: queryKeys.transaction.sell.list(params),
    queryFn: () => sellService.list(params),
  });
}

export function useSell(id: number | null) {
  return useQuery({
    queryKey: queryKeys.transaction.sell.detail(id ?? 0),
    queryFn: () => sellService.get(id!),
    enabled: !!id,
  });
}

export function useCreateSell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSellDTO) => sellService.create(data),
    onSuccess: () => {
      invalidationMap.transaction.sell().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      // Sell decreases stock, invalidate items
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}

export function useUpdateSell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: UpdateSellDTO }) =>
      sellService.update(id, data),
    onSuccess: (_, variables) => {
      invalidationMap.transaction.sell().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.transaction.sell.detail(variables.id),
      });
      // Invalidate items for stock refresh
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}

export function useDeleteSell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => sellService.delete(id),
    onSuccess: () => {
      invalidationMap.transaction.sell().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      // Invalidate items for stock refresh
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}
