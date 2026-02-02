"use client";

import { CircleUser, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useBranch } from "@/providers/branch-provider";
import { useState } from "react";
import { MobileSidebar } from "./mobile-sidebar";
import Link from "next/link";
import { useProfile } from "@/hooks/app/use-user";
import { useAuth } from "@/providers/auth-provider";

export function Navbar() {
    const router = useRouter();
    const { branch, setBranch } = useBranch();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { data: profile } = useProfile();
    const { logout } = useAuth()



    const handleSwitchBranch = () => {
        setBranch(null); // Clear context
        router.push("/dashboard"); // Navigate to selection
    };

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">

            {/* Mobile Sidebar Trigger */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                onClick={() => setMobileMenuOpen(true)}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>

            <MobileSidebar open={mobileMenuOpen} setOpen={setMobileMenuOpen} />

            <div className="w-full flex-1">
                {/* Branch Selection Dropdown Placeholder */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-[200px] justify-start text-left font-normal hidden md:flex">
                            {branch ? branch.name : "Pilih Cabang"}
                        </Button>
                    </DropdownMenuTrigger>
                    {/* For Mobile: maybe show just an icon or smaller button if needed, but sidebar covers nav */}

                    <DropdownMenuContent className="w-[200px]">
                        <DropdownMenuLabel>Ganti Cabang</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSwitchBranch}>
                            Ubah Cabang
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Branch display if needed, or arguably it's in the sidebar title? For now let's keep it simple */}
                <div className="md:hidden font-medium text-sm truncate">
                    {branch ? branch.name : "Pilih Cabang"}
                </div>
            </div>
            <DropdownMenu>
                <span className="text-sm font-medium">{profile?.data?.name}</span>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/dashboard/profile">
                        <DropdownMenuItem>Pengaturan</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem>Bantuan</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Keluar</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
