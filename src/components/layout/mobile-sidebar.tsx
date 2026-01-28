"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { menuItems } from "@/constants/menu-items";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

interface MobileSidebarProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function MobileSidebar({ open, setOpen }: MobileSidebarProps) {
    const pathname = usePathname();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Hasmart</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-auto py-4">
                    <nav className="grid items-start px-2 text-sm font-medium">
                        {menuItems.map((item, index) => (
                            <MobileSidebarItem
                                key={index}
                                item={item}
                                pathname={pathname}
                                setOpen={setOpen}
                            />
                        ))}
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function MobileSidebarItem({
    item,
    pathname,
    setOpen
}: {
    item: typeof menuItems[0];
    pathname: string;
    setOpen: (open: boolean) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const isChildActive = item.children?.some(child => child.href === pathname);
    const isActive = item.href ? pathname === item.href : false;

    if (item.children) {
        return (
            <Collapsible open={isOpen || isChildActive} onOpenChange={setIsOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <button
                        className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary",
                            (isOpen || isChildActive) && "bg-muted text-primary"
                        )}
                    >
                        {item.icon}
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronRight
                            className={cn("ml-auto h-4 w-4 transition-transform", (isOpen || isChildActive) && "rotate-90")}
                        />
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="ml-4 mt-1 flex flex-col gap-1 border-l pl-2">
                        {item.children.map((child, index) => (
                            <Link
                                key={index}
                                href={child.href || "#"}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm",
                                    pathname === child.href && "bg-muted text-primary font-medium"
                                )}
                            >
                                {child.title}
                            </Link>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return (
        <Link
            href={item.href || "#"}
            onClick={() => setOpen(false)}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary",
                isActive && "bg-muted text-primary"
            )}
        >
            {item.icon}
            {item.title}
        </Link>
    );
}
