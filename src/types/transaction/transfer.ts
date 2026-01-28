import { BaseResponse } from "../common";
import { Branch } from "../app/branch";
import { Item, ItemVariant } from "../master/item";

export interface TransferItem {
  id: number;
  transactionTransferId: number;
  masterItemId: number;
  masterItemVariantId: number;
  qty: number;
  masterItem?: Item;
  masterItemVariant?: ItemVariant;
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: number;
  transactionDate: string;
  fromId: number;
  toId: number;
  notes?: string | null;
  fromBranch?: Branch;
  toBranch?: Branch;
  items: TransferItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateTransferItemDTO {
  masterItemId: number;
  masterItemVariantId: number;
  qty: number;
}

export interface CreateTransferDTO {
  transactionDate: string;
  fromId: number;
  toId: number;
  notes?: string | null;
  items: CreateTransferItemDTO[];
}

export type UpdateTransferDTO = Partial<CreateTransferDTO>;

export type TransferResponse = BaseResponse<Transfer>;
export type TransferListResponse = BaseResponse<Transfer[]>;
