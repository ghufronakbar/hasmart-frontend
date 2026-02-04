"use client";

import React, { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Receipt } from "@/components/custom/receipt";
import { useReceipt } from "@/hooks/report/use-receipt";

export default function ReceiptPreviewPage() {
    const searchParams = useSearchParams();
    const transactionId = searchParams.get("id");
    const type = searchParams.get("type");

    const { data: transaction, isLoading, error: salesError } = useReceipt(type!, transactionId!);

    const componentRef = useRef<HTMLDivElement>(null);

    // --- PERBAIKAN DISINI ---
    // 1. Ganti 'content' menjadi 'contentRef'
    // 2. Masukkan object ref langsung (componentRef), BUKAN callback (() => componentRef.current)
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Struk-${transactionId}`,
    });
    // ------------------------

    if (!transactionId) return <div className="p-10">Mohon sertakan parameter ?id=...</div>;
    if (!type) return <div className="p-10">Mohon sertakan parameter ?type=...</div>;
    if (isLoading) return <div className="p-10">Loading Preview...</div>;
    if (salesError) return <div className="p-10 text-red-500">Error: {salesError.message}</div>;
    if (!transaction?.data) return <div className="p-10">Data Struk Tidak Ditemukan</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center gap-6">
            <div className="flex gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Kembali
                </button>

                {/* Tombol Print Manual */}
                <button
                    onClick={() => handlePrint()}
                    className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-lg"
                >
                    🖨️ PRINT STRUK
                </button>
            </div>

            <div className="text-sm text-gray-500 mb-2">
                Preview Tampilan (Lebar 58mm):
            </div>

            <div className="shadow-2xl border border-gray-200">
                {/* Pastikan Receipt support forwardRef */}
                {transaction && <Receipt ref={componentRef} data={transaction.data} />}
            </div>
        </div>
    );
}