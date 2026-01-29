"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { purchaseService } from "@/services/transaction/purchase.service";
import { queryKeys, invalidationMap } from "@/constants/query-keys";
import {
  CreatePurchaseDTO,
  UpdatePurchaseDTO,
  PurchaseListResponse,
} from "@/types/transaction/purchase";
import { FilterQuery } from "@/types/common";

// --- Purchase Hooks ---

export function usePurchases(
  params?: FilterQuery & {
    dateStart?: string;
    dateEnd?: string;
    branchId?: number;
  },
) {
  return useQuery<PurchaseListResponse>({
    queryKey: queryKeys.transaction.purchase.list(params),
    queryFn: () => purchaseService.list(params),
  });
}

export function usePurchase(id: number | null) {
  return useQuery({
    queryKey: queryKeys.transaction.purchase.detail(id ?? 0),
    queryFn: () => purchaseService.get(id!),
    enabled: !!id,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseDTO) => purchaseService.create(data),
    onSuccess: () => {
      invalidationMap.transaction.purchase().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      // Also invalidate stock/item queries if needed?
      // Since purchase affects stock, we might want to invalidate items.
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UpdatePurchaseDTO;
    }) => purchaseService.update(id, data),
    onSuccess: (_, variables) => {
      invalidationMap.transaction.purchase().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.transaction.purchase.detail(variables.id),
      });
      // Invalidate items for stock refresh
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => purchaseService.delete(id),
    onSuccess: () => {
      invalidationMap.transaction.purchase().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      // Invalidate items for stock refresh
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}
