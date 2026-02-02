"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { itemService } from "@/services/master/item.service";
import { queryKeys, invalidationMap } from "@/constants/query-keys";
import {
  CreateItemDTO,
  CreateItemVariantDTO,
  UpdateItemDTO,
  UpdateItemVariantDTO,
} from "@/types/master/item";
import { FilterQuery } from "@/types/common";
import { useBranch } from "@/providers/branch-provider";

// --- Item Hooks ---

export function useItems(params?: FilterQuery & { idNotIns?: string }) {
  const { branch } = useBranch();
  return useQuery({
    queryKey: queryKeys.master.items.list({ ...params, branchId: branch?.id }),
    queryFn: () => itemService.list({ ...params, branchId: branch?.id }),
  });
}

export function useItem(id: number | null, params?: { branchId?: number }) {
  return useQuery({
    queryKey: queryKeys.master.items.detail(id ?? 0),
    queryFn: () => itemService.get(id!, params),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemDTO) => itemService.create(data),
    onSuccess: () => {
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateItemDTO }) =>
      itemService.update(id, data),
    onSuccess: (_, variables) => {
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.master.items.detail(variables.id),
      });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => itemService.delete(id),
    onSuccess: () => {
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}

// --- Variant Hooks ---

export function useAddVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: number;
      data: CreateItemVariantDTO;
    }) => itemService.addVariant(itemId, data),
    onSuccess: (_, variables) => {
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.master.items.detail(variables.itemId),
      });
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      variantId,
      data,
    }: {
      itemId: number;
      variantId: number;
      data: UpdateItemVariantDTO;
    }) => itemService.updateVariant(itemId, variantId, data),
    onSuccess: (_, variables) => {
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.master.items.detail(variables.itemId),
      });
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      variantId,
    }: {
      itemId: number;
      variantId: number;
    }) => itemService.deleteVariant(itemId, variantId),
    onSuccess: (_, variables) => {
      invalidationMap.master.item().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.master.items.detail(variables.itemId),
      });
    },
  });
}

export function useItemByCode(code: string | undefined) {
  return useQuery({
    queryKey: ["master", "item", "by-code", code],
    queryFn: () => itemService.getItemByCode(code!),
    enabled: !!code,
  });
}
