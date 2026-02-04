import { axiosInstance } from "@/lib/axios";
import { LabelResponse } from "@/types/report/label";

export const labelService = {
  get: async (masterItemIds: number[]) => {
    const response = await axiosInstance.get<LabelResponse>(
      `/report/label?masterItemIds=${masterItemIds.join(",")}`,
    );
    return response.data;
  },
};
