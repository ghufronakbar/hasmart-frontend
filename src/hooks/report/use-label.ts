"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { labelService } from "@/services/report/label.service";

export function useLabel(masterItemIds: number[]) {
  return useQuery({
    queryKey: queryKeys.report.label(masterItemIds),
    queryFn: () => labelService.get(masterItemIds),
    enabled: !!masterItemIds && masterItemIds.length > 0,
  });
}
