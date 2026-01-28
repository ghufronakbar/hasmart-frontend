"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBranch } from "@/providers/branch-provider";
import { Loader2 } from "lucide-react";

export default function OverviewPage() {
    const router = useRouter();
    const { branch, isLoading } = useBranch();

    useEffect(() => {
        if (!isLoading && !branch) {
            router.replace("/dashboard");
        }
    }, [branch, isLoading, router]);

    if (isLoading || !branch) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Overview: {branch.name}</h1>
            <p className="text-muted-foreground">
                Selamat datang di dashboard operasional cabang <strong>{branch.name}</strong> ({branch.code}).
            </p>
            {/* Add Widgets/Stats here later */}
        </div>
    );
}
