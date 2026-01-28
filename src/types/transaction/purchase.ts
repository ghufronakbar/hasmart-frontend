import { BaseResponse } from "../common";
import { Item, ItemVariant } from "../master/item";
import { Supplier } from "../master/supplier";

export interface PurchaseItemDiscount {
  percentage: number;
}

export interface PurchaseItem {
  id: number;
  transactionPurchaseId: number;
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

export interface Purchase {
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
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreatePurchaseItemDTO {
  masterItemId: number;
  masterItemVariantId: number;
  qty: number;
  purchasePrice: number;
  discounts?: { percentage: number }[];
}

export interface CreatePurchaseDTO {
  invoiceNumber: string;
  transactionDate: string;
  dueDate?: string | null;
  masterSupplierId: number;
  branchId: number;
  notes?: string | null;
  taxAmount?: number;
  items: CreatePurchaseItemDTO[];
}

export type UpdatePurchaseDTO = Partial<CreatePurchaseDTO>;

export type PurchaseResponse = BaseResponse<Purchase>;
export type PurchaseListResponse = BaseResponse<Purchase[]>;
