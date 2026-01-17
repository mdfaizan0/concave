"use client"

import React, { useEffect, useState } from "react"
import { fetchRecent } from "@/api/files.api"
import { FileList } from "@/components/files/FileList"
import { Clock, Loader2, LayoutGrid } from "lucide-react"
import { toast } from "sonner"

export default function RecentPage() {
    const [loading, setLoading] = useState(true)
    const [files, setFiles] = useState([])

    const loadRecent = async () => {
        setLoading(true)
        try {
            const data = await fetchRecent()
            setFiles(data || [])
        } catch (error) {
            console.error("Failed to load recent files", error)
            toast.error("Failed to load recent files")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRecent()
    }, [])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground gap-4">
                <div className="bg-primary/10 p-6 rounded-full">
                    <Clock className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold">No recent files</h3>
                    <p className="text-sm opacity-70">Files you access recently will appear here.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Recent</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">History</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b border-border/40 pb-2">
                    <LayoutGrid className="w-4 h-4" />
                    FILES
                </div>
                <FileList
                    files={files}
                    onRefresh={loadRecent}
                />
            </div>
        </div>
    )
}
