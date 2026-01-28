import { BaseResponse } from "../common";
import { Item, ItemVariant } from "../master/item";
import { Supplier } from "../master/supplier";

export interface PurchaseReturnItem {
  id: number;
  transactionPurchaseReturnId: number;
  masterItemId: number;
  masterItemVariantId: number;
  qty: number;
  purchasePrice: number;
  recordedTotalAmount: number;
  masterItem?: Item;
  masterItemVariant?: ItemVariant;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseReturn {
  id: number;
  invoiceNumber: string;
  transactionDate: string;
  dueDate?: string | null;
  masterSupplierId: number;
  branchId: number;
  notes?: string | null;
  taxAmount: number;
  recordedTotalAmount: number;
  masterSupplier?: Supplier;
  items: PurchaseReturnItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreatePurchaseReturnItemDTO {
  masterItemId: number;
  masterItemVariantId: number;
  qty: number;
  purchasePrice: number;
  discounts?: { percentage: number }[];
}

export interface CreatePurchaseReturnDTO {
  invoiceNumber: string;
  transactionDate: string;
  dueDate?: string | null;
  masterSupplierId: number;
  branchId: number;
  notes?: string | null;
  taxAmount?: number;
  items: CreatePurchaseReturnItemDTO[];
}

export type UpdatePurchaseReturnDTO = Partial<CreatePurchaseReturnDTO>;

export type PurchaseReturnResponse = BaseResponse<PurchaseReturn>;
export type PurchaseReturnListResponse = BaseResponse<PurchaseReturn[]>;
