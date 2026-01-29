import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import { axiosInstance as api } from "@/lib/axios";
import {
  TransactionTransfersResponse,
  TransactionTransferResponse,
  CreateTransactionTransferDTO,
  UpdateTransactionTransferDTO,
} from "@/types/transaction/transfer";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface UseTransfersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "asc" | "desc";
  sortBy?: string;
  fromId?: number;
  toId?: number;
  dateStart?: Date;
  dateEnd?: Date;
}

export function useTransfers(params: UseTransfersParams) {
  return useQuery({
    queryKey: [
      ...queryKeys.transaction.transfers.list(),
      params.page,
      params.limit,
      params.search,
      params.sort,
      params.sortBy,
      params.fromId,
      params.toId,
      params.dateStart?.toISOString(),
      params.dateEnd?.toISOString(),
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.search) searchParams.append("search", params.search);
      if (params.sort) searchParams.append("sort", params.sort);
      if (params.sortBy) searchParams.append("sortBy", params.sortBy);
      if (params.fromId)
        searchParams.append("fromId", params.fromId.toString());
      if (params.toId) searchParams.append("toId", params.toId.toString());
      if (params.dateStart)
        searchParams.append("dateStart", params.dateStart.toISOString());
      if (params.dateEnd)
        searchParams.append("dateEnd", params.dateEnd.toISOString());

      const { data } = await api.get<TransactionTransfersResponse>(
        `/transaction/transfer?${searchParams.toString()}`,
      );
      return data;
    },
  });
}

export function useTransfer(id: number | null) {
  return useQuery({
    queryKey: queryKeys.transaction.transfers.detail(id || 0),
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<TransactionTransferResponse>(
        `/transaction/transfer/${id}`,
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionTransferDTO) => {
      const { data: response } = await api.post<TransactionTransferResponse>(
        "/transaction/transfer",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.transaction.transfers.all,
      });
      toast.success("Transfer berhasil dibuat");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Gagal membuat transfer");
    },
  });
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateTransactionTransferDTO;
    }) => {
      const { data: response } = await api.put<TransactionTransferResponse>(
        `/transaction/transfer/${id}`,
        data,
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.transaction.transfers.all,
      });
      if (data.data?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.transaction.transfers.detail(data.data.id),
        });
      }
      toast.success("Transfer berhasil diperbarui");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui transfer",
      );
    },
  });
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/transaction/transfer/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.transaction.transfers.all,
      });
      toast.success("Transfer berhasil dihapus");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Gagal menghapus transfer");
    },
  });
}
