import { BaseResponse } from "../common";
import { Item, ItemVariant } from "../master/item";
import { Member } from "../master/member";

export interface SalesItem {
  id: number;
  transactionSalesId: number;
  masterItemId: number;
  masterItemVariantId: number;
  qty: number;
  salesPrice: number;
  recordedTotalAmount: number;
  masterItem?: Item;
  masterItemVariant?: ItemVariant;
  transactionSalesDiscounts?: {
    id: number;
    percentage: number;
    recordedAmount: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Sales {
  id: number;
  invoiceNumber: string;
  transactionDate: string;
  branchId: number;
  memberCode?: string | null;
  masterMemberId?: number | null;
  notes?: string | null;
  recordedTotalAmount: number;
  masterMember?: Member;
  items: SalesItem[];
  transactionSalesItems?: SalesItem[]; // Backend relation name
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateSalesItemDTO {
  masterItemId: number;
  masterItemVariantId: number;
  qty: number;
  salesPrice: number;
  discounts?: { percentage: number }[];
}

export interface CreateSalesDTO {
  branchId: number;
  memberCode?: string | null;
  notes?: string | null;
  items: CreateSalesItemDTO[];
}

export type UpdateSalesDTO = Partial<CreateSalesDTO>;

export type SalesResponse = BaseResponse<Sales>;
export type SalesListResponse = BaseResponse<Sales[]>;
