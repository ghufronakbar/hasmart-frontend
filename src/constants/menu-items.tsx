import { LayoutDashboard, Database, FileText, Settings } from "lucide-react";

export type MenuItem = {
    title: string;
    href?: string;
    icon?: React.ReactNode;
    children?: MenuItem[];
};

export const menuItems: MenuItem[] = [
    {
        title: "Dasbor",
        href: "/dashboard/overview",
        icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
        title: "Aplikasi",
        icon: <Settings className="h-4 w-4" />,
        children: [
            { title: "Pengguna", href: "/dashboard/app/user" },
            { title: "Cabang", href: "/dashboard/app/branch" },
        ],
    },
    {
        title: "Data Master",
        icon: <Database className="h-4 w-4" />,
        children: [
            { title: "Barang", href: "/dashboard/master/items" },
            { title: "Kategori Barang", href: "/dashboard/master/item-categories" },
            { title: "Pelanggan", href: "/dashboard/master/members" },
            { title: "Kategori Pelanggan", href: "/dashboard/master/member-categories" },
            { title: "Pemasok", href: "/dashboard/master/suppliers" },
            { title: "Satuan", href: "/dashboard/master/units" },
        ],
    },
    {
        title: "Transaksi",
        icon: <FileText className="h-4 w-4" />,
        children: [
            { title: "Pembelian", href: "/dashboard/transaction/purchase" },
            { title: "Retur Pembelian", href: "/dashboard/transaction/purchase-return" },
            { title: "Penjualan", href: "/dashboard/transaction/sales" },
            { title: "Retur Penjualan", href: "/dashboard/transaction/sales-return" },
            { title: "Kasir", href: "/dashboard/transaction/sell" },
            { title: "Retur Kasir", href: "/dashboard/transaction/sell-return" },
            { title: "Penyesuaian Stok", href: "/dashboard/transaction/adjust-stock" },
            { title: "Transfer Stok", href: "/dashboard/transaction/transfer" },
        ],
    },
];
