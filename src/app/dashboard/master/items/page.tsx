"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Loader2,
    Plus,
    Pencil,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    CirclePlus,
    X,

} from "lucide-react";
import { toast } from "sonner";
import { PaginationState } from "@tanstack/react-table";

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

} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { Item, ItemVariant } from "@/types/master/item";
import {
    useItems,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
    useAddVariant,
    useUpdateVariant,
    useDeleteVariant,
} from "@/hooks/master/use-item";
import { useSuppliers } from "@/hooks/master/use-supplier";
import { useItemCategories } from "@/hooks/master/use-item-category";
import { useUnits } from "@/hooks/master/use-unit";
import { useDebounce } from "@/hooks/use-debounce";

import { Combobox } from "@/components/custom/combobox";
import { AxiosError } from "axios";

// --- Validation Schemas ---

const variantSchema = z.object({
    id: z.number().optional(), // For edit
    code: z.string().min(1, "Kode variant wajib"),
    unit: z.string().min(1, "Satuan wajib"),
    amount: z.coerce.number().min(1, "Jumlah konversi min 1"),
    sellPrice: z.coerce.number().min(0, "Harga jual min 0"),
    isBaseUnit: z.boolean().default(false),
});

const createItemSchema = z.object({
    name: z.string().min(1, "Nama item wajib"),
    masterSupplierId: z.coerce.number().min(1, "Supplier wajib"),
    masterItemCategoryId: z.coerce.number().min(1, "Kategori wajib"),
    isActive: z.boolean().default(true),
    masterItemVariants: z.array(variantSchema)
        .min(1, "Minimal 1 variant wajib")
        .refine((variants) => {
            const baseUnits = variants.filter(v => v.amount === 1);
            return baseUnits.length <= 1;
        }, "Hanya boleh ada satu variant dengan konversi 1 (Base Unit).")
        .refine(() => {
            // In Create wizard, we just ensure duplicates of amount=1 are caught.
            // We can optionally enforce AT LEAST ONE base unit if required, but backend only says min 1 variant.
            // Usually Base Unit is required. Let's enforce it?
            // Backend spec: "Minimal harus ada 1 variant". If logic says amount=1 isBaseUnit=true, then user *must* add one with amount 1?
            // Not strictly enforced by backend text, but good UX. Let's stick to duplications check first.
            return true;
        }),
});

const updateItemSchema = z.object({
    name: z.string().min(1, "Nama item wajib"),
    masterSupplierId: z.coerce.number().min(1, "Supplier wajib"),
    masterItemCategoryId: z.coerce.number().min(1, "Kategori wajib"),
    isActive: z.boolean().default(true),
});

type CreateItemFormValues = z.infer<typeof createItemSchema>;
type UpdateItemFormValues = z.infer<typeof updateItemSchema>;
type VariantFormValues = z.infer<typeof variantSchema>;



export default function ItemsPage() {
    // --- State ---
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // --- Hooks ---
    const { data: itemData, isLoading: isItemLoading } = useItems({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch,
    });
    const { data: suppliers } = useSuppliers({ limit: 100 });
    const { data: categories } = useItemCategories({ limit: 100 });
    const { data: units } = useUnits({ limit: 100 });

    const { mutate: createItem, isPending: isCreating } = useCreateItem();
    const { mutate: updateItem, isPending: isUpdating } = useUpdateItem();
    const { mutate: deleteItem } = useDeleteItem();
    const { mutate: addVariant, isPending: isAddingVariant } = useAddVariant();
    const { mutate: updateVariant, isPending: isUpdatingVariant } = useUpdateVariant();
    const { mutate: deleteVariant } = useDeleteVariant();

    // --- Dialog States ---
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    const [deletingItem, setDeletingItem] = useState<Item | null>(null);
    const [deletingVariant, setDeletingVariant] = useState<{ itemId: number, variant: ItemVariant } | null>(null);

    // --- Forms ---
    // 1. Create Form
    const createForm = useForm<CreateItemFormValues>({
        resolver: zodResolver(createItemSchema) as any,
        defaultValues: {
            name: "",
            masterSupplierId: 0,
            masterItemCategoryId: 0,
            isActive: true,
            masterItemVariants: [{
                code: "",
                unit: "",
                amount: 1, // Default base unit
                sellPrice: 0,
                isBaseUnit: true // Default true for first one
            }],
        },
    });

    const { fields: variantFields, append, remove } = useFieldArray({
        control: createForm.control,
        name: "masterItemVariants",
    });



    // Effect to auto-set isBaseUnit based on amount = 1
    useEffect(() => {
        const subscription = createForm.watch((value, { name }) => {
            if (name?.includes('amount')) {
                // If amount changes, we might need to update isBaseUnit for that specific field
                // But useWatch is better for handling the whole array state.
                // Actually, let's just do it in onSubmit or let the user see it? 
                // User requirement: "hilangkan check base unit, itu buat otomatis saja... jika konversi = 1 maka base unit true"
                // Ideally, we update the form value for isBaseUnit hidden field.

                // Let's iterate and update. Note: avoid infinite loops.
                // We can't use setValue inside watch effect easily without care.
                // A better approach: calculate isBaseUnit during submission OR use a transform in Zod?
                // But the user might want visual feedback if we showed the checkbox. Since we hide it,
                // we can just derive it at submit time.
                // HOWEVER, the validation "tidak bisa menambahkan varian dengan konversi 1 lagi" needs immediate feedback preferably.
                // Zod resolver handles the validation feedback.
            }
        });
        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createForm.watch]);

    // 2. Edit Item Form (Info Only)
    const editItemForm = useForm<UpdateItemFormValues>({
        resolver: zodResolver(updateItemSchema) as any,
        defaultValues: {
            name: "",
            masterSupplierId: 0,
            masterItemCategoryId: 0,
            isActive: true,
        },
    });

    // 3. Variant Management Form (Single Variant Add/Edit)
    const [variantDialogOpen, setVariantDialogOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ItemVariant | null>(null);

    const variantForm = useForm<VariantFormValues>({
        resolver: zodResolver(variantSchema) as any,
        defaultValues: {
            code: "",
            unit: "",
            amount: 1,
            sellPrice: 0,
            isBaseUnit: false,
        },
    });

    // --- Handlers ---

    // Create Item
    const onCreateSubmit = (values: CreateItemFormValues) => {
        // Auto-assign isBaseUnit based on amount
        const processedVariants = values.masterItemVariants.map(v => ({
            ...v,
            isBaseUnit: v.amount === 1
        }));

        createItem({ ...values, masterItemVariants: processedVariants }, {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                toast.success("Item berhasil dibuat");
            },
            onError: (err) => {
                toast.error(err instanceof AxiosError ? err?.response?.data?.errors?.message : "Gagal membuat item");
            }
        });
    };

    // Update Item Info
    const onUpdateItemSubmit = (values: UpdateItemFormValues) => {
        if (!editingItem) return;
        updateItem({ id: editingItem.id, data: values }, {
            onSuccess: () => {
                toast.success("Info item berhasil diperbarui");
                setEditingItem(prev => prev ? { ...prev, ...values } : null); // Optimistic update
            },
            onError: (err) => {
                toast.error(err instanceof AxiosError ? err?.response?.data?.errors?.message : "Gagal membuat item");
            }
        });
    };

    // Variant Actions inside Edit Dialog
    const openAddVariant = () => {
        setEditingVariant(null);
        variantForm.reset({
            code: "",
            unit: "",
            amount: 1,
            sellPrice: 0,
            isBaseUnit: false,
        });
        setVariantDialogOpen(true);
    };

    const openEditVariant = (variant: ItemVariant) => {
        setEditingVariant(variant);
        variantForm.reset({
            code: variant.code,
            unit: variant.unit,
            amount: variant.amount,
            sellPrice: variant.sellPrice,
            isBaseUnit: variant.isBaseUnit,
        });
        setVariantDialogOpen(true);
    };

    const onVariantSubmit = (values: VariantFormValues) => {
        if (!editingItem) return;

        const amount = Number(values.amount);
        const isBaseUnit = amount === 1;

        // Validation for Add: Check if Base Unit already exists in existing variants
        if (!editingVariant && isBaseUnit) {
            const hasBaseUnit = editingItem.masterItemVariants.some(v => v.amount === 1);
            if (hasBaseUnit) {
                variantForm.setError("amount", {
                    type: "manual",
                    message: "Variant dengan konversi 1 (Base Unit) sudah ada."
                });
                return;
            }
        }

        // Validation for Edit: If changing TO amount 1, check if OTHER base unit exists
        if (editingVariant && isBaseUnit) {
            const anotherBaseUnit = editingItem.masterItemVariants.find(v => v.amount === 1 && v.id !== editingVariant.id);
            if (anotherBaseUnit) {
                variantForm.setError("amount", {
                    type: "manual",
                    message: "Variant lain dengan konversi 1 sudah ada."
                });
                return;
            }
        }

        const payload = { ...values, isBaseUnit };

        if (editingVariant) {
            // Update
            updateVariant({
                itemId: editingItem.id,
                variantId: editingVariant.id!,
                data: payload
            }, {
                onSuccess: () => {
                    setVariantDialogOpen(false);
                    toast.success("Variant berhasil diperbarui");
                },
                onError: (err) =>
                    toast.error(err instanceof AxiosError ? err?.response?.data?.errors?.message : "Gagal membuat item")
            });
        } else {
            // Add
            addVariant({ itemId: editingItem.id, data: payload as any }, {
                onSuccess: () => {
                    setVariantDialogOpen(false);
                    toast.success("Variant berhasil ditambahkan");
                },
                onError: (err) =>
                    toast.error(err instanceof AxiosError ? err?.response?.data?.errors?.message : "Gagal membuat item")
            });
        }
    };

    const handleEditClick = (item: Item) => {
        setEditingItem(item);
        editItemForm.reset({
            name: item.name,
            masterSupplierId: item.masterSupplierId,
            masterItemCategoryId: item.masterItemCategoryId,
            isActive: item.isActive,
        });
        setIsEditOpen(true);
    };

    const handleDeleteItem = () => {
        if (!deletingItem) return;
        deleteItem(deletingItem.id, {
            onSuccess: () => {
                setDeletingItem(null);
                toast.success("Item berhasil dihapus");
            },
            onError: (err) => toast.error(err instanceof AxiosError ? err?.response?.data?.errors?.message : "Gagal membuat item")
        });
    };

    const handleDeleteVariant = () => {
        if (!deletingVariant) return;
        deleteVariant({ itemId: deletingVariant.itemId, variantId: deletingVariant.variant.id }, {
            onSuccess: () => {
                setDeletingVariant(null);
                toast.success("Variant berhasil dihapus");
            },
            onError: (err) => toast.error(err instanceof AxiosError ? err?.response?.data?.errors?.message : "Gagal membuat item")
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Manajemen Item</h2>
                <Button onClick={() => { setIsCreateOpen(true); createForm.reset(); }}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Item
                </Button>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Cari item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
            </div>

            {/* Custom Table with Rowspan */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">ID</TableHead>
                            <TableHead>Nama Item</TableHead>
                            <TableHead>Harga Beli <span className="text-xs text-muted-foreground">(satuan)</span></TableHead>
                            <TableHead>Stok</TableHead>
                            <TableHead>Variant</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Konversi</TableHead>
                            <TableHead>Estimasi Keuntungan</TableHead>
                            <TableHead>Harga Jual</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isItemLoading ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                                </TableCell>
                            </TableRow>
                        ) : itemData?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center">
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        ) : (
                            itemData?.data?.map((item) => {
                                const variants = item.masterItemVariants || [];
                                const rowSpan = variants.length || 1;

                                return variants.map((variant, index) => (
                                    <TableRow key={variant.id}>
                                        {index === 0 && (
                                            <>
                                                <TableCell rowSpan={rowSpan} className="align-top font-medium border-r">
                                                    {item.id}
                                                </TableCell>
                                                <TableCell rowSpan={rowSpan} className="align-top border-r">
                                                    <div className="font-semibold">{item.name}</div>
                                                    <Badge variant={item.isActive ? "default" : "secondary"}>
                                                        {item.isActive ? "Aktif" : "Nonaktif"}
                                                    </Badge>
                                                    {item.masterItemCategory?.name ? (
                                                        <Badge variant="outline">
                                                            {item.masterItemCategory.name}
                                                        </Badge>
                                                    ) : "-"}
                                                    {item.masterSupplier?.code ? (
                                                        <Badge variant="outline">
                                                            {item.masterSupplier?.code ? `${item.masterSupplier.code} (${item.masterSupplier?.name})` : "-"}
                                                        </Badge>
                                                    ) : "-"}
                                                </TableCell>
                                                <TableCell rowSpan={rowSpan} className="align-top border-r">
                                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.recordedBuyPrice)}
                                                </TableCell>
                                                <TableCell rowSpan={rowSpan} className="align-top border-r">
                                                    {item.stock}
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell>
                                            <span className="font-mono text-xs">{variant.code}</span>
                                            {variant.isBaseUnit && <Badge variant="secondary" className="ml-2 text-[10px]">Base</Badge>}
                                        </TableCell>
                                        <TableCell>{variant.unit}</TableCell>
                                        <TableCell>{variant.amount}</TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(variant.recordedProfitAmount)} ({variant.recordedProfitPercentage}%)
                                        </TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(variant.sellPrice)}
                                        </TableCell>

                                        {index === 0 && (
                                            <TableCell rowSpan={rowSpan} className="align-top text-right border-l">
                                                <div className="flex flex-col gap-1 items-end">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)}>
                                                        <Pencil className="h-4 w-4 mr-1" /> Edit
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeletingItem(item)}>
                                                        <Trash2 className="h-4 w-4 mr-1" /> Hapus
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ));
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Manual */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex - 1 }))}
                    disabled={pagination.pageIndex === 0}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <div className="text-sm">
                    Page {pagination.pageIndex + 1} of {itemData?.pagination?.totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                    disabled={!itemData?.pagination?.hasNextPage}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* --- CREATE Dialog --- */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tambah Item Baru</DialogTitle>
                        <DialogDescription>Masukan detail item dan variant awal.</DialogDescription>
                    </DialogHeader>
                    <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                            {/* Section 1: Item Info */}
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <FormField control={createForm.control} name="name" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Nama Item</FormLabel>
                                        <FormControl><Input placeholder="Contoh: Indomie Goreng" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={createForm.control} name="masterItemCategoryId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kategori</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                value={field.value}
                                                onChange={field.onChange}
                                                options={categories?.data || []}
                                                placeholder="Pilih Kategori"
                                                searchPlaceholder="Cari kategori..."
                                                renderLabel={(item) => <>{item.code ? <span className="mr-2 font-mono text-xs opacity-50">{item.code}</span> : null} {item.name}</>}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={createForm.control} name="masterSupplierId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                value={field.value}
                                                onChange={field.onChange}
                                                options={suppliers?.data || []}
                                                placeholder="Pilih Supplier"
                                                searchPlaceholder="Cari supplier..."
                                                renderLabel={(item) => <>{item.code ? <span className="mr-2 font-mono text-xs opacity-50">{item.code}</span> : null} {item.name}</>}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            {/* Section 2: Variants */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-medium">Variants</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ code: "", unit: "", amount: 1, sellPrice: 0, isBaseUnit: false })}>
                                        <CirclePlus className="mr-2 h-4 w-4" /> Tambah Variant
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {variantFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-4 items-end border p-4 rounded-md bg-muted/20 relative">
                                            {index > 0 && (
                                                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-red-500" onClick={() => remove(index)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <div className="grid grid-cols-4 gap-4 w-full">
                                                <FormField control={createForm.control} name={`masterItemVariants.${index}.code`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Kode</FormLabel>
                                                        <FormControl><Input {...field} placeholder="Kode unik" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={createForm.control} name={`masterItemVariants.${index}.unit`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Satuan</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {units?.data?.map(u => (
                                                                    <SelectItem key={u.id} value={u.unit}>{u.unit}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={createForm.control} name={`masterItemVariants.${index}.amount`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Konversi</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={createForm.control} name={`masterItemVariants.${index}.sellPrice`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Harga Jual</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                {/* Hidden base unit, managed by logic */}
                                            </div>
                                        </div>
                                    ))}
                                    {createForm.formState.errors.masterItemVariants?.root && (
                                        <p className="text-sm text-red-500">{createForm.formState.errors.masterItemVariants.root.message}</p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>{isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan Item</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* --- EDIT Dialog --- */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Item: {editingItem?.name}</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="info">
                        <TabsList>
                            <TabsTrigger value="info">Informasi Dasar</TabsTrigger>
                            <TabsTrigger value="variants">Variants</TabsTrigger>
                        </TabsList>
                        <TabsContent value="info" className="space-y-4 pt-4">
                            <Form {...editItemForm}>
                                <form onSubmit={editItemForm.handleSubmit(onUpdateItemSubmit)} className="space-y-4">
                                    <FormField control={editItemForm.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Item</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={editItemForm.control} name="masterItemCategoryId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kategori</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        options={categories?.data || []}
                                                        placeholder="Pilih Kategori"
                                                        renderLabel={(item) => <>{item.code ? <span className="mr-2 font-mono text-xs opacity-50">{item.code}</span> : null} {item.name}</>}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={editItemForm.control} name="masterSupplierId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Supplier</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        options={suppliers?.data || []}
                                                        placeholder="Pilih Supplier"
                                                        renderLabel={(item) => <>{item.code ? <span className="mr-2 font-mono text-xs opacity-50">{item.code}</span> : null} {item.name}</>}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={editItemForm.control} name="isActive" render={({ field }) => (
                                        <FormItem className="flex items-center gap-2 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel>Status Aktif</FormLabel>
                                        </FormItem>
                                    )} />
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isUpdating}>{isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Info</Button>
                                    </div>
                                </form>
                            </Form>
                        </TabsContent>
                        <TabsContent value="variants" className="pt-4">
                            <div className="flex justify-end mb-4">
                                <Button size="sm" onClick={openAddVariant}><Plus className="mr-2 h-4 w-4" /> Tambah Variant</Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Konversi</TableHead>
                                        <TableHead>Harga</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {editingItem?.masterItemVariants?.map(v => (
                                        <TableRow key={v.id}>
                                            <TableCell>{v.code}</TableCell>
                                            <TableCell>{v.unit}</TableCell>
                                            <TableCell>{v.amount}</TableCell>
                                            <TableCell>{v.sellPrice}</TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditVariant(v)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setDeletingVariant({ itemId: editingItem.id, variant: v })}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* --- VARIANT Dialog (Add/Edit) --- */}
            <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingVariant ? "Edit Variant" : "Tambah Variant"}</DialogTitle>
                    </DialogHeader>
                    <Form {...variantForm}>
                        <form onSubmit={variantForm.handleSubmit(onVariantSubmit)} className="space-y-4">
                            <FormField control={variantForm.control} name="code" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kode Variant</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={variantForm.control} name="unit" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Satuan</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {units?.data?.map(u => <SelectItem key={u.id} value={u.unit}>{u.unit}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={variantForm.control} name="amount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Konversi</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={variantForm.control} name="sellPrice" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Harga Jual</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isAddingVariant || isUpdatingVariant}>Simpan</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* --- DELETE ITEM & VARIANT ALERTS --- */}
            <AlertDialog open={!!deletingItem} onOpenChange={(o) => !o && setDeletingItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><DialogTitle>Hapus Item?</DialogTitle></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={!!deletingVariant} onOpenChange={(o) => !o && setDeletingVariant(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><DialogTitle>Hapus Variant {deletingVariant?.variant.code}?</DialogTitle></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteVariant} className="bg-red-600">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
