import { axiosInstance } from "@/lib/axios";
import { FilterQuery } from "@/types/common";
import {
  CreatePurchaseDTO,
  PurchaseListResponse,
  PurchaseResponse,
  UpdatePurchaseDTO,
} from "@/types/transaction/purchase";

export const purchaseService = {
  list: async (params?: FilterQuery) => {
    const response = await axiosInstance.get<PurchaseListResponse>(
      "/transaction/purchase",
      { params },
    );
    return response.data;
  },

  get: async (id: number | string) => {
    const response = await axiosInstance.get<PurchaseResponse>(
      `/transaction/purchase/${id}`,
    );
    return response.data;
  },

  create: async (data: CreatePurchaseDTO) => {
    const response = await axiosInstance.post<PurchaseResponse>(
      "/transaction/purchase",
      data,
    );
    return response.data;
  },

  update: async (id: number | string, data: UpdatePurchaseDTO) => {
    const response = await axiosInstance.put<PurchaseResponse>(
      `/transaction/purchase/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number | string) => {
    const response = await axiosInstance.delete<PurchaseResponse>(
      `/transaction/purchase/${id}`,
    );
    return response.data;
  },
};
