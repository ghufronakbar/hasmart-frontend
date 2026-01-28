import { BaseResponse } from "../common";
import { Item, ItemVariant } from "../master/item";
import { Member } from "../master/member";

export interface SalesReturnItem {
  id: number;
  transactionSalesReturnId: number;
  masterItemId: number;
  masterItemVariantId: number;
  qty: number;
  salesPrice: number;
  recordedTotalAmount: number;
  masterItem?: Item;
  masterItemVariant?: ItemVariant;
  createdAt: string;
  updatedAt: string;
}

export interface SalesReturn {
  id: number;
  returnNumber: string;
  originalInvoiceNumber: string;
  transactionDate: string;
  branchId: number;
  masterMemberId?: number | null;
  notes?: string | null;
  recordedTotalAmount: number;
  masterMember?: Member;
  items: SalesReturnItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateSalesReturnItemDTO {
  masterItemId: number;
  masterItemVariantId: number;
  qty: number;
  salesPrice: number;
  discounts?: { percentage: number }[];
}

export interface CreateSalesReturnDTO {
  branchId: number;
  originalInvoiceNumber: string;
  notes?: string | null;
  items: CreateSalesReturnItemDTO[];
}

export type UpdateSalesReturnDTO = Partial<CreateSalesReturnDTO>;

export type SalesReturnResponse = BaseResponse<SalesReturn>;
export type SalesReturnListResponse = BaseResponse<SalesReturn[]>;
