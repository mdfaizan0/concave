"use client"

import React, { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"

export default function SharedPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login")
        }
    }, [user, authLoading, router])
    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-500 fill-blue-500/20" />
                    Shared with me
                </h1>
                <p className="text-sm text-muted-foreground">
                    Files and folders others have shared with you.
                </p>
            </div>

            <div className="h-px bg-border/40 w-full" />

            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/10 rounded-3xl bg-muted/20">
                <div className="p-5 bg-background border border-border/40 rounded-3xl mb-4 shadow-sm">
                    <Users className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Collaboration is coming</h3>
                <p className="text-sm text-muted-foreground/60 max-w-[200px]">Shared items will be listed here in a future update.</p>
            </div>
        </div>
    )
}
