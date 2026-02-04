import { axiosInstance } from "@/lib/axios";
import { ReceiptResponse } from "@/types/report/receipt";

export const receiptService = {
  get: async (type: string, receiptId: number | string) => {
    const response = await axiosInstance.get<ReceiptResponse>(
      `/report/receipt/${type}/${receiptId}`,
    );
    return response.data;
  },
};
