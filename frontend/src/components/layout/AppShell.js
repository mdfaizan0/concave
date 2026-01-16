"use client"

import React from "react"
import { useAuth } from "@/context/AuthContext"
import { usePathname } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

export function AppShell({ children }) {
    const { user, loading } = useAuth()
    const pathname = usePathname()

    // Do not show AppShell on landing, login, and signup pages
    const isAuthPage = pathname === "/" || pathname === "/login" || pathname === "/signup"

    if (isAuthPage) {
        return <>{children}</>
    }

    // Handle loading state to prevent layout flicker
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-muted-foreground">Initializing Concave...</div>
            </div>
        )
    }

    // For authenticated routes (once loading is done)
    return (
        <div className="flex min-h-screen bg-background text-foreground transition-all duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="p-1">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
