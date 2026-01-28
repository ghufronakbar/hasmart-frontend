"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBranch } from "@/providers/branch-provider";
import { useBranches } from "@/hooks/app/use-branch";
import { Branch } from "@/types/app/branch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Store, MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
    const router = useRouter();
    const { branch, setBranch } = useBranch();
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch all branches (paginated but getting first page with large limit for now, or implement search)
    // For selection screen, we probably want to search.
    const { data: branchesData, isLoading } = useBranches({
        page: 1,
        limit: 50, // Reasonable limit for selection screen
        search: searchTerm,
    });

    // If branch is already selected and valid, redirect to overview
    useEffect(() => {
        if (branch) {
            router.push("/dashboard/overview");
        }
    }, [branch, router]);

    const handleSelectBranch = (selectedBranch: Branch) => {
        setBranch(selectedBranch);
        router.push("/dashboard/overview");
    };

    if (branch) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 md:px-8 max-w-5xl">
            <div className="flex flex-col space-y-6 text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight">Selamat Datang di Hasmart</h1>
                <p className="text-muted-foreground text-lg">
                    Silakan pilih cabang untuk melanjutkan ke dashboard operasional.
                </p>
                <div className="mx-auto w-full max-w-md">
                    <Input
                        placeholder="Cari cabang..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 text-lg"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : branchesData?.data && branchesData.data.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {branchesData.data.map((b: Branch) => (
                        <Card
                            key={b.id}
                            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group relative overflow-hidden"
                            onClick={() => handleSelectBranch(b)}
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                        <Store className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground uppercase tracking-wider">
                                        {b.code}
                                    </span>
                                </div>
                                <CardTitle className="text-xl">{b.name}</CardTitle>
                                <CardDescription className="line-clamp-1">
                                    {b.email || 'Tidak ada email'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                        <span className="line-clamp-2">{b.address || 'Alamat belum diatur'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 shrink-0" />
                                        <span>{b.phone || '-'}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t w-full">
                                    <Button className="w-full" variant="secondary">
                                        Pilih Cabang
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
                    <Store className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">Tidak ada cabang ditemukan</h3>
                    <p className="text-muted-foreground">
                        {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : "Belum ada data cabang."}
                    </p>
                </div>
            )}
        </div>
    );
}
