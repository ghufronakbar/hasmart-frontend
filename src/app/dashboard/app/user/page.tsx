"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ColumnDef,
    getCoreRowModel,
    useReactTable,
    PaginationState,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table";
import {
    Loader2,
    Plus,
    Trash2,
    MoreHorizontal,
    KeyRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { User } from "@/types/app/user";
import {
    useUsers,
    useCreateUser,
    useDeleteUser,
    useResetUserPassword,
} from "@/hooks/app/use-user";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";

// --- Validation Schemas ---

const createUserSchema = z.object({
    name: z.string().min(3, "Nama pengguna minimal 3 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    isActive: z.boolean(),
});

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function UsersPage() {
    // --- State ---
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    // Search State
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // --- Data Fetching ---
    const { data: userData, isLoading: isUserLoading } = useUsers({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch,
        sort: sorting[0]?.desc ? "desc" : "asc",
        sortBy: sorting[0]?.id,
    });

    // --- Dialog States ---
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    // --- Mutations ---
    const { mutate: createUser, isPending: isCreating } = useCreateUser();
    const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
    const { mutate: resetPassword, isPending: isResetting } = useResetUserPassword();

    // --- Forms ---
    const createForm = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            password: "",
            isActive: true,
        },
    });

    const resetPasswordForm = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
        },
    });

    // --- Handlers ---
    const handleCreateOpenChange = (open: boolean) => {
        setIsCreateOpen(open);
        if (!open) {
            createForm.reset({
                name: "",
                password: "",
                isActive: true,
            });
        }
    };

    const handleResetPasswordOpenChange = (open: boolean) => {
        setIsResetPasswordOpen(open);
        if (!open) {
            setSelectedUser(null);
            resetPasswordForm.reset({ newPassword: "" });
        }
    };

    const onCreateSubmit = (values: CreateUserFormValues) => {
        createUser(values, {
            onSuccess: () => {
                setIsCreateOpen(false);
                toast.success("Pengguna berhasil dibuat");
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
                const message = error?.response?.data?.errors?.message || "Gagal membuat pengguna";
                toast.error(message);
            },
        });
    };

    const onResetPasswordSubmit = (values: ResetPasswordFormValues) => {
        if (!selectedUser) return;

        resetPassword(
            { id: selectedUser.id, data: values },
            {
                onSuccess: () => {
                    setIsResetPasswordOpen(false);
                    toast.success("Password berhasil direset");
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onError: (error: any) => {
                    const message = error?.response?.data?.errors?.message || "Gagal mereset password";
                    toast.error(message);
                },
            }
        );
    };

    const handleDelete = () => {
        if (deletingUser) {
            deleteUser(deletingUser.id, {
                onSuccess: () => {
                    setDeletingUser(null);
                    toast.success("Pengguna berhasil dihapus");
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onError: (error: any) => {
                    const message = error?.response?.data?.errors?.message || "Gagal menghapus pengguna";
                    toast.error(message);
                },
            });
        }
    };

    // --- Table Columns ---
    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Nama Pengguna" />
                ),
            },
            {
                accessorKey: "isActive",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) => {
                    const isActive = row.getValue("isActive") as boolean;
                    return (
                        <Badge variant={isActive ? "default" : "destructive"}>
                            {isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "isSuperUser",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Role" />
                ),
                cell: ({ row }) => {
                    const isSuperUser = row.getValue("isSuperUser") as boolean;
                    return isSuperUser ? <Badge variant="secondary">Super User</Badge> : <span>User</span>;
                }
            },
            {
                accessorKey: "createdAt",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Dibuat Pada" />
                ),
                cell: ({ row }) => {
                    const date = new Date(row.getValue("createdAt"));
                    return new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }).format(date);
                },
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const user = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setIsResetPasswordOpen(true);
                                    }}
                                >
                                    <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => setDeletingUser(user)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        []
    );

    // --- Table Instance ---
    const table = useReactTable({
        data: userData?.data || [],
        columns,
        state: {
            pagination,
            sorting,
            columnVisibility,
        },
        pageCount: userData?.pagination?.totalPages || -1,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h2>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
                </Button>
            </div>

            <DataTableToolbar
                table={table}
                filterValue={searchTerm}
                onFilterChange={setSearchTerm}
                placeholder="Cari pengguna..."
            />

            <DataTable
                table={table}
                columnsLength={columns.length}
                isLoading={isUserLoading}
                showSelectedRowCount={false}
            />

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                        <DialogDescription>
                            Isi formulir di bawah ini untuk membuat pengguna baru.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                            <FormField
                                control={createForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Pengguna</FormLabel>
                                        <FormControl>
                                            <Input placeholder="cth: kasir1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={createForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={createForm.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Aktif
                                            </FormLabel>
                                            <FormDescription>
                                                Pengguna aktif dapat login ke sistem.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={isResetPasswordOpen} onOpenChange={handleResetPasswordOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reset Password - {selectedUser?.name}</DialogTitle>
                        <DialogDescription>
                            Masukkan password baru untuk pengguna ini.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...resetPasswordForm}>
                        <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                            <FormField
                                control={resetPasswordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password Baru</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={isResetting}>
                                    {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Reset Password
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pengguna
                            <strong> {deletingUser?.name}</strong> secara permanen.
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
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
