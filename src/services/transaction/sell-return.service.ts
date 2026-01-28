import { axiosInstance } from "@/lib/axios";
import { FilterQuery } from "@/types/common";
import {
  CreateSellReturnDTO,
  SellReturnListResponse,
  SellReturnResponse,
  UpdateSellReturnDTO,
} from "@/types/transaction/sell-return";

export const sellReturnService = {
  list: async (params?: FilterQuery) => {
    const response = await axiosInstance.get<SellReturnListResponse>(
      "/transaction/sell-return",
      { params },
    );
    return response.data;
  },

  get: async (id: number | string) => {
    const response = await axiosInstance.get<SellReturnResponse>(
      `/transaction/sell-return/${id}`,
    );
    return response.data;
  },

  create: async (data: CreateSellReturnDTO) => {
    const response = await axiosInstance.post<SellReturnResponse>(
      "/transaction/sell-return",
      data,
    );
    return response.data;
  },

  update: async (id: number | string, data: UpdateSellReturnDTO) => {
    const response = await axiosInstance.put<SellReturnResponse>(
      `/transaction/sell-return/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number | string) => {
    const response = await axiosInstance.delete<SellReturnResponse>(
      `/transaction/sell-return/${id}`,
    );
    return response.data;
  },
};
