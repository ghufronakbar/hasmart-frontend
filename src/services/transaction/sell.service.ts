import { axiosInstance } from "@/lib/axios";
import { FilterQuery } from "@/types/common";
import {
  CreateSellDTO,
  SellListResponse,
  SellResponse,
  UpdateSellDTO,
} from "@/types/transaction/sell";

export const sellService = {
  list: async (params?: FilterQuery) => {
    const response = await axiosInstance.get<SellListResponse>(
      "/transaction/sell",
      { params },
    );
    return response.data;
  },

  get: async (id: number | string) => {
    const response = await axiosInstance.get<SellResponse>(
      `/transaction/sell/${id}`,
    );
    return response.data;
  },

  create: async (data: CreateSellDTO) => {
    const response = await axiosInstance.post<SellResponse>(
      "/transaction/sell",
      data,
    );
    return response.data;
  },

  update: async (id: number | string, data: UpdateSellDTO) => {
    const response = await axiosInstance.put<SellResponse>(
      `/transaction/sell/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number | string) => {
    const response = await axiosInstance.delete<SellResponse>(
      `/transaction/sell/${id}`,
    );
    return response.data;
  },
};
