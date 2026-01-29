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
  discounts?: PurchaseItemDiscount[];
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
  recordedTaxAmount: number;
  recordedTaxPercentage: number;
  recordedTotalAmount: number;
  masterSupplier?: Supplier;
  items: PurchaseItem[];
  // Backend response might have items here
  transactionPurchaseItems?: PurchaseItem[];
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
  taxPercentage: number;
  items: CreatePurchaseItemDTO[];
}

export type UpdatePurchaseDTO = CreatePurchaseDTO;

export type PurchaseResponse = BaseResponse<Purchase>;
export type PurchaseListResponse = BaseResponse<Purchase[]>;
