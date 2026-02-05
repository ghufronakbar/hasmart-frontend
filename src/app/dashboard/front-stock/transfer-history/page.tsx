"use client";

import { useMemo, useState } from "react";
import {
    ColumnDef,
    getCoreRowModel,
    useReactTable,
    PaginationState,
    SortingState,
} from "@tanstack/react-table";
import {
    Loader2,
    Trash2,
    MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { FrontStockTransfer } from "@/types/stock/front-stock";
import {
    useFrontStockTransfers,
    useDeleteFrontStockTransfer,
} from "@/hooks/stock/use-front-stock";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useBranch } from "@/providers/branch-provider";
import { AxiosError } from "axios";
import { useAccessControl, UserAccess } from "@/hooks/use-access-control";
import { useRouter } from "next/navigation";

export default function FrontStockHistoryPage() {
    useAccessControl([UserAccess.accessFrontStockHistoryRead], true);
    const { branch, isLoading: isBranchLoading } = useBranch();
    const router = useRouter();

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchTerm, setSearchTerm] = useState(""); // Search notes
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: transferData, isLoading } = useFrontStockTransfers({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch, // Assuming search works on notes/user
        sort: sorting[0]?.desc ? "desc" : "asc",
        sortBy: sorting[0]?.id,
    });

    const { mutate: deleteTransfer, isPending: isDeleting } = useDeleteFrontStockTransfer();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deletingId) {
            deleteTransfer(deletingId, {
                onSuccess: () => {
                    toast.success("Transfer berhasil dihapus (void)");
                    setDeletingId(null);
                },
                onError: (error) => {
                    toast.error(error instanceof AxiosError ? error.response?.data?.message : "Gagal menghapus transfer");
                }
            });
        }
    };

    const columns = useMemo<ColumnDef<FrontStockTransfer>[]>(() => [
        {
            accessorKey: "createdAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
            cell: ({ row }) => format(new Date(row.getValue("createdAt")), "dd MMM yyyy HH:mm", { locale: id }),
        },
        {
            accessorKey: "notes",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Catatan" />,
        },
        {
            id: "items_summary",
            header: "Barang",
            cell: ({ row }) => {
                const items = row.original.items || [];
                const summary = items.map(i => {
                    const itemName = i.masterItem?.name || "-";
                    const variantUnit = i.masterItemVariant?.unit ? ` ${i.masterItemVariant.unit}` : "";
                    const amount = i.amount;
                    const amountStr = amount > 0 ? `+${amount}` : `${amount}`;
                    return `${itemName} (${amountStr}${variantUnit})`;
                }).join(", ");
                return <div className="max-w-[400px] truncate" title={summary}>{summary}</div>;
            }
        },
        {
            accessorKey: "user.name",
            header: "User",
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeletingId(row.original.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />  Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ], []);

    const table = useReactTable({
        data: transferData?.data || [],
        columns,
        state: { pagination, sorting },
        pageCount: transferData?.pagination?.totalPages || -1,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
    });

    if (isBranchLoading) return <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
    </div>

    if (!branch && !isBranchLoading) {
        toast.error("Harap pilih cabang terlebih dahulu");
        router.push("/dashboard");
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Riwayat Transfer Front Stock</h2>
            </div>

            <DataTableToolbar
                table={table}
                filterValue={searchTerm}
                onFilterChange={setSearchTerm}
                placeholder="Cari riwayat..."
            />
            <DataTable
                table={table}
                columnsLength={columns.length}
                isLoading={isLoading}
                showSelectedRowCount={false}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Batalkan Transfer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan mengembalikan stok ke posisi sebelum transfer ini dilakukan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Void Transaksi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}