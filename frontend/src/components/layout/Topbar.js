"use client"

import React from "react"
import { Search, Settings, HelpCircle, Bell, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/search/SearchInput"
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
                <SearchInput />
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
