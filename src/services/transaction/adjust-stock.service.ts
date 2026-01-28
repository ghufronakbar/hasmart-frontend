import { axiosInstance } from "@/lib/axios";
import { FilterQuery } from "@/types/common";
import {
  AdjustStockDetailResponse,
  AdjustStockListResponse,
  AdjustStockResponse,
  CreateAdjustStockDTO,
} from "@/types/transaction/adjust-stock";

export const adjustStockService = {
  list: async (params?: FilterQuery) => {
    const response = await axiosInstance.get<AdjustStockListResponse>(
      "/transaction/adjust-stock",
      { params },
    );
    return response.data;
  },

  get: async (id: number | string) => {
    const response = await axiosInstance.get<AdjustStockDetailResponse>(
      `/transaction/adjust-stock/${id}`,
    );
    return response.data;
  },

  create: async (data: CreateAdjustStockDTO) => {
    const response = await axiosInstance.post<AdjustStockResponse>(
      "/transaction/adjust-stock",
      data,
    );
    return response.data;
  },

  delete: async (id: number | string) => {
    const response = await axiosInstance.delete<AdjustStockDetailResponse>(
      `/transaction/adjust-stock/${id}`,
    );
    return response.data;
  },
};
