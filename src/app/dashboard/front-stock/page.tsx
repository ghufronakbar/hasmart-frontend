"use client";

import { useAccessControl, UserAccess } from "@/hooks/use-access-control";

export default function FrontStockPage() {
    useAccessControl([UserAccess.accessFrontStockRead], true);
    return (
        <div>
            <h1>Front Stock</h1>
        </div>
    );
}