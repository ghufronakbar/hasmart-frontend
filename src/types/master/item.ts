import { BaseResponse } from "../common";
import { ItemCategory } from "./item-category";
import { Supplier } from "./supplier";

export interface ItemVariant {
  id: number;
  code: string;
  unit: string;
  amount: number;
  sellPrice: number;
  recordedProfitPercentage: number;
  recordedProfitAmount: number;
  isBaseUnit: boolean;
  masterItemId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Item {
  id: number;
  name: string;
  masterItemCategoryId: number;
  masterSupplierId: number;
  isActive: boolean;
  recordedBuyPrice: number;
  stock: number; // Global stock or branch-specific based on query
  masterItemCategory?: ItemCategory;
  masterSupplier?: Supplier;
  masterItemVariants: ItemVariant[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateItemVariantDTO {
  code: string;
  unit: string;
  amount: number;
  sellPrice: number;
  isBaseUnit: boolean;
}

export interface CreateItemDTO {
  name: string;
  masterSupplierId: number;
  masterItemCategoryId: number;
  isActive: boolean;
  masterItemVariants: CreateItemVariantDTO[];
}

export interface UpdateItemDTO {
  name?: string;
  masterSupplierId?: number;
  masterItemCategoryId?: number;
  isActive?: boolean;
}

export type UpdateItemVariantDTO = Partial<CreateItemVariantDTO>;

export type ItemResponse = BaseResponse<Item>;
export type ItemListResponse = BaseResponse<Item[]>;

export interface ItemVariantWithItem extends ItemVariant {
  masterItem: Item;
}

export type ItemVariantResponse = BaseResponse<ItemVariantWithItem>;
