"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HardDrive, Users, Star, Clock, Trash2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import logo from "@/app/icon0.svg"

const sidebarItems = [
    { icon: HardDrive, label: "My Drive", href: "/dashboard", color: "text-blue-500" },
    { icon: Users, label: "Shared", href: "/dashboard/shared", color: "text-green-500" },
    { icon: Star, label: "Starred", href: "/dashboard/starred", color: "text-amber-500" },
    { icon: Clock, label: "Recent", href: "/dashboard/recent", color: "text-purple-500" },
    { icon: Trash2, label: "Trash", href: "/dashboard/trash", color: "text-red-500" },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const [storageUsed, setStorageUsed] = useState(0)
    const storageTotal = 15 // GB
    const storageUsedGB = 2.4

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.email) return "U"
        return user.email.charAt(0).toUpperCase()
    }

    // Animate storage bar on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setStorageUsed((storageUsedGB / storageTotal) * 100)
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="flex bg-card flex-col w-64 border-r border-border/50 h-screen transition-all duration-300">
            {/* Header with Logo */}
            <div className="p-6 flex items-center gap-3 border-b border-border/30">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <Image src={logo} alt="concave-logo" className="w-10 h-10 relative z-10" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                        Concave
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                        Cloud Storage
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3">
                <div className="space-y-1 py-4">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Button
                                key={item.href}
                                asChild
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 px-4 py-5 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary/10 text-foreground shadow-sm border border-primary/10"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                                )}
                            >
                                <Link href={item.href} className="flex items-center gap-3 w-full">
                                    {isActive && (
                                        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent" />
                                    )}
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-all duration-200 relative z-10",
                                        isActive ? item.color : "text-muted-foreground group-hover:text-foreground"
                                    )} />
                                    <span className="relative z-10 flex-1">{item.label}</span>
                                    {isActive && (
                                        <ChevronRight className="h-4 w-4 text-primary relative z-10" />
                                    )}
                                </Link>
                            </Button>
                        )
                    })}
                </div>
            </ScrollArea>

            {/* User Info */}
            <div className="px-4 py-3 border-t border-border/50">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                            {getUserInitials()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate text-foreground">
                            {user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                            {user?.email || 'user@example.com'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Storage Info */}
            <div className="p-4 border-t border-border/50 space-y-3">
                <div className="px-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground">Storage</span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                            {storageUsedGB} / {storageTotal} GB
                        </span>
                    </div>
                    <Progress
                        value={storageUsed}
                        className="h-2 bg-secondary"
                    />
                    <p className="text-[10px] text-muted-foreground mt-2">
                        {(100 - storageUsed).toFixed(0)}% available
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                >
                    Upgrade Storage
                </Button>
            </div>
        </div>
    )
}
