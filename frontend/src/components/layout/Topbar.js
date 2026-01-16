"use client"

import React from "react"
import { Search, Settings, HelpCircle, Bell, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export function Topbar() {
    const { session, signOut } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        if (session) {
            await signOut()
            router.push("/login")
        } 
        return
    }

    return (
        <div className="h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300">
            <div className="flex-1 max-w-2xl px-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                        placeholder="Search in drive..."
                        className="pl-10 h-10 w-full bg-secondary/30 border-none transition-all focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:bg-background"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title="Help">
                    <HelpCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title="Notifications">
                    <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title="Settings">
                    <Settings className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                    onClick={handleSignOut}
                    title="Sign Out"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
