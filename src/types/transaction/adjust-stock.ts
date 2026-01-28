import { BaseResponse } from "../common";
import { Item, ItemVariant } from "../master/item";

export interface AdjustStockItem {
  id: number;
  transactionAdjustmentId: number;
  masterItemId: number;
  masterItemVariantId: number;
  currentStock: number;
  actualQty: number;
  gapAmount: number;
  notes?: string | null;
  masterItem?: Item;
  masterItemVariant?: ItemVariant;
  createdAt: string;
  updatedAt: string;
}

export interface AdjustStock {
  id: number;
  transactionDate: string;
  branchId: number;
  notes?: string | null;
  items: AdjustStockItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AdjustStockItemDTO {
  masterItemId: number;
  masterItemVariantId: number;
  actualQty: number;
}

export interface CreateAdjustStockDTO {
  branchId: number;
  notes?: string | null;
  items: AdjustStockItemDTO[];
}

export type AdjustStockResponse = BaseResponse<AdjustStock[]>; // Returns array of created adjustments
export type AdjustStockListResponse = BaseResponse<AdjustStock[]>;
export type AdjustStockDetailResponse = BaseResponse<AdjustStock>;
