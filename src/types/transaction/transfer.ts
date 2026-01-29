import { BaseResponse } from "@/types/common";
import { Branch } from "@/types/app/branch";
import { Item, ItemVariant } from "@/types/master/item";

export interface TransactionTransferItem {
  id: number;
  transactionTransferId: number;
  masterItemId: number;
  masterItemVariantId: number;
  qty: number;
  recordedConversion: number;
  totalQty: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  // Relations
  masterItem?: Item;
  masterItemVariant?: ItemVariant;
}

export interface TransactionTransfer {
  id: number;
  transactionDate: string;
  notes?: string;
  fromId: number;
  toId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  // Relations
  from?: Branch;
  to?: Branch;
  transactionTransferItems?: TransactionTransferItem[];
}

export interface CreateTransactionTransferItemDTO {
  masterItemId: number;
  masterItemVariantId: number;
  qty: number;
}

export interface CreateTransactionTransferDTO {
  transactionDate: Date;
  fromId: number;
  toId: number;
  notes?: string;
  items: CreateTransactionTransferItemDTO[];
}

export type UpdateTransactionTransferDTO =
  Partial<CreateTransactionTransferDTO>;

export type TransactionTransferResponse = BaseResponse<TransactionTransfer>;
export type TransactionTransfersResponse = BaseResponse<TransactionTransfer[]>;
