import { useRouter } from "next/navigation";
import { useAuth } from "./use-auth";
import { useEffect, useMemo } from "react";

export enum UserAccess {
  accessOverviewRead = "accessOverviewRead",
  accessReportRead = "accessReportRead",
  accessPointOfSalesRead = "accessPointOfSalesRead",
  accessPointOfSalesWrite = "accessPointOfSalesWrite",
  accessAppUserRead = "accessAppUserRead",
  accessAppUserWrite = "accessAppUserWrite",
  accessAppBranchWrite = "accessAppBranchWrite",
  accessMasterItemRead = "accessMasterItemRead",
  accessMasterItemWrite = "accessMasterItemWrite",
  accessMasterItemCategoryRead = "accessMasterItemCategoryRead",
  accessMasterItemCategoryWrite = "accessMasterItemCategoryWrite",
  accessMasterMemberRead = "accessMasterMemberRead",
  accessMasterMemberWrite = "accessMasterMemberWrite",
  accessMasterMemberCategoryRead = "accessMasterMemberCategoryRead",
  accessMasterMemberCategoryWrite = "accessMasterMemberCategoryWrite",
  accessMasterSupplierRead = "accessMasterSupplierRead",
  accessMasterSupplierWrite = "accessMasterSupplierWrite",
  accessMasterUnitRead = "accessMasterUnitRead",
  accessMasterUnitWrite = "accessMasterUnitWrite",
  accessTransactionPurchaseRead = "accessTransactionPurchaseRead",
  accessTransactionPurchaseWrite = "accessTransactionPurchaseWrite",
  accessTransactionPurchaseReturnRead = "accessTransactionPurchaseReturnRead",
  accessTransactionPurchaseReturnWrite = "accessTransactionPurchaseReturnWrite",
  accessTransactionSalesRead = "accessTransactionSalesRead",
  accessTransactionSalesWrite = "accessTransactionSalesWrite",
  accessTransactionSalesReturnRead = "accessTransactionSalesReturnRead",
  accessTransactionSalesReturnWrite = "accessTransactionSalesReturnWrite",
  accessTransactionSellRead = "accessTransactionSellRead",
  accessTransactionSellWrite = "accessTransactionSellWrite",
  accessTransactionSellReturnRead = "accessTransactionSellReturnRead",
  accessTransactionSellReturnWrite = "accessTransactionSellReturnWrite",
  accessTransactionTransferRead = "accessTransactionTransferRead",
  accessTransactionTransferWrite = "accessTransactionTransferWrite",
  accessTransactionAdjustmentRead = "accessTransactionAdjustmentRead",
  accessTransactionAdjustmentWrite = "accessTransactionAdjustmentWrite",
}

export const useAccessControl = (access: UserAccess[], redirect: boolean) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      const hasAccess = access.every((acc) => user[acc]);
      if (!hasAccess && redirect) {
        router.push("/dashboard/profile");
      }
    }
  }, [user, isLoading, router, access, redirect]);

  return useMemo(() => access.every((acc) => user?.[acc]), [user, access]);
};
