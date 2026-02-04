"use client";

import { useState } from "react";
import { useAccessControl, UserAccess } from "@/hooks/use-access-control";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth } from "date-fns";
import { useBranch } from "@/providers/branch-provider";
import { DatePickerWithRange } from "@/components/custom/date-picker-with-range";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { userService } from "@/services/app/user.service";
import { ENV } from "@/constants/env";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { AxiosError } from "axios";

const REPORTS = [
    {
        id: "purchase",
        title: "Laporan Pembelian",
        description: "Rekap transaksi pembelian dari supplier.",
        endpoint: "/report/purchase",
    },
    {
        id: "purchase-return",
        title: "Laporan Retur Pembelian",
        description: "Rekap pengembalian barang ke supplier.",
        endpoint: "/report/purchase-return",
    },
    {
        id: "sales",
        title: "Laporan Penjualan (Kasir)",
        description: "Rekap transaksi penjualan kasir (POS).",
        endpoint: "/report/sales",
    },
    {
        id: "sales-return",
        title: "Laporan Retur Penjualan (Kasir)",
        description: "Rekap retur penjualan kasir.",
        endpoint: "/report/sales-return",
    },
    {
        id: "sell",
        title: "Laporan Penjualan (B2B)",
        description: "Rekap penjualan grosir/B2B.",
        endpoint: "/report/sell",
    },
    {
        id: "sell-return",
        title: "Laporan Retur Penjualan (B2B)",
        description: "Rekap retur penjualan grosir/B2B.",
        endpoint: "/report/sell-return",
    },
];

export default function ReportPage() {
    useAccessControl([UserAccess.accessReportRead], true);

    const { refetch: refetchAuth } = useAuth(); // To sync context if needed
    const { branch } = useBranch();
    const [loading, setLoading] = useState<string | null>(null);

    // Default date to current month
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const now = new Date();
        return {
            from: startOfMonth(now),
            to: endOfMonth(now),
        };
    });

    const handleDownload = async (
        reportId: string,
        endpoint: string,
        formatType: "pdf" | "xlsx"
    ) => {
        if (loading) return;

        try {
            setLoading(`${reportId}-${formatType}`);
            const loadingToast = toast.loading("Mempersiapkan download...");

            // 1. Refresh Token
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                throw new Error("Sesi habis, silakan login ulang.");
            }

            // Proactive refresh as requested
            const refreshResponse = await userService.refreshToken(refreshToken);
            const newAccessToken = refreshResponse.data.accessToken;

            // Update local storage and context (optional but good practice)
            localStorage.setItem("token", newAccessToken);

            // We don't necessarily await refetchAuth() since we have the token
            // but it keeps the app state in sync
            refetchAuth();

            // 2. Build URL
            const params = new URLSearchParams();
            params.append("accessToken", newAccessToken);
            params.append("exportAs", formatType);

            if (dateRange?.from) {
                params.append("dateStart", dateRange.from.toISOString());
            }
            if (dateRange?.to) {
                params.append("dateEnd", dateRange.to.toISOString());
            }
            if (branch) {
                params.append("branchId", branch.id.toString());
            }

            const url = `${ENV.API_URL}/api${endpoint}?${params.toString()}`;

            // 3. Open in new tab
            window.open(url, "_blank");

            toast.dismiss(loadingToast);
            toast.success("Download dimulai");

        } catch (error) {
            console.error("Download error:", error);
            toast.dismiss();
            toast.error(error instanceof AxiosError ? error.response?.data?.message || "Gagal mengunduh laporan" : "Gagal mengunduh laporan");

            // // If refresh failed, might need login
            // if (error?.response?.status === 401) {
            //     // Let auth provider handle redirect or manual
            //     // router.push('/login') 
            // }
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Laporan</h1>
                    <p className="text-muted-foreground">
                        {branch
                            ? `Laporan data cabang ${branch.name}`
                            : "Menampilkan laporan semua cabang"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-2">
                        Periode:
                    </span>
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {REPORTS.map((report) => (
                    <Card key={report.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription>{report.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto pt-0">
                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="outline"
                                    className="w-full flex gap-2"
                                    onClick={() =>
                                        handleDownload(report.id, report.endpoint, "pdf")
                                    }
                                    disabled={!!loading}
                                >
                                    {loading === `${report.id}-pdf` ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-red-500" />
                                    )}
                                    PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full flex gap-2"
                                    onClick={() =>
                                        handleDownload(report.id, report.endpoint, "xlsx")
                                    }
                                    disabled={!!loading}
                                >
                                    {loading === `${report.id}-xlsx` ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                    )}
                                    Excel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}