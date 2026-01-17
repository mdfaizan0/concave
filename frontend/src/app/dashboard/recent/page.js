"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { FileList } from "@/components/files/FileList"
import { fetchRecent } from "@/api/files.api"
import { toast } from "sonner"
import { Clock } from "lucide-react"

export default function RecentPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login")
        }
    }, [user, authLoading, router])

    const loadRecent = useCallback(async () => {
        setLoading(true)
        try {
            const data = await fetchRecent()
            setFiles(data)
        } catch (error) {
            toast.error(error.message || "Failed to load recent files")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!authLoading && user) {
            loadRecent()
        }
    }, [user?.id, authLoading, loadRecent])

    useEffect(() => {
        const handleUploadSuccess = () => {
            loadRecent()
        }

        window.addEventListener("concave-upload-success", handleUploadSuccess)
        return () => window.removeEventListener("concave-upload-success", handleUploadSuccess)
    }, [loadRecent])

    if (authLoading || (loading && files.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground animate-pulse">Fetching recent activity...</p>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <Clock className="h-8 w-8 text-primary" />
                    Recent
                </h1>
                <p className="text-sm text-muted-foreground">
                    Files you've modified or uploaded recently.
                </p>
            </div>

            <div className="h-px bg-border/40 w-full" />

            {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/10 rounded-3xl bg-muted/20">
                    <div className="p-5 bg-background border border-border/40 rounded-3xl mb-4 shadow-sm">
                        <Clock className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">No recent activity</h3>
                    <p className="text-sm text-muted-foreground/60 max-w-[200px]">Your recently used files will appear here.</p>
                </div>
            ) : (
                <FileList files={files} onRefresh={loadRecent} />
            )}

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-xs font-medium text-primary/80 uppercase tracking-wider">
                    Read-only view
                </p>
            </div>
        </div>
    )
}
