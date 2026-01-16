"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HardDrive, Users, Star, Clock, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const sidebarItems = [
    { icon: HardDrive, label: "My Drive", href: "/dashboard" },
    { icon: Users, label: "Shared", href: "/dashboard/shared" },
    { icon: Star, label: "Starred", href: "/dashboard/starred" },
    { icon: Clock, label: "Recent", href: "/dashboard/recent" },
    { icon: Trash2, label: "Trash", href: "/dashboard/trash" },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex bg-card flex-col w-64 border-r border-border/50 h-screen transition-all duration-300">
            <div className="p-6">
                <h2 className="text-xl font-bold tracking-tighter">Concave</h2>
            </div>
            <ScrollArea className="flex-1 px-3">
                <div className="space-y-1 py-2">
                    {sidebarItems.map((item) => (
                        <Button
                            key={item.href}
                            asChild
                            variant={pathname === item.href ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 px-4 py-6 text-sm font-medium transition-all duration-200",
                                pathname === item.href
                                    ? "bg-secondary text-secondary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            )}
                        >
                            <Link href={item.href}>
                                <item.icon className={cn(
                                    "h-5 w-5",
                                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                                )} />
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-border/50">
                <div className="px-4 py-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Storage
                </div>
                <div className="px-4 py-2 space-y-2">
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[20%] transition-all duration-500" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        2.4 GB of 15 GB used
                    </p>
                </div>
            </div>
        </div>
    )
}
