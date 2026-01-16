"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { FileList } from "@/components/files/FileList"
import { FolderList } from "@/components/folders/FolderList"
import { fetchTrash } from "@/api/files.api"
import { toast } from "sonner"
import { Trash2, AlertCircle } from "lucide-react"

export default function TrashPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [items, setItems] = useState({ files: [], folders: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login")
        }
    }, [user, authLoading, router])

    const loadTrash = useCallback(async () => {
        setLoading(true)
        setItems({ files: [], folders: [] }) // Clear stale items
        try {
            const data = await fetchTrash()
            setItems(data)
        } catch (error) {
            toast.error(error.message || "Failed to load trash")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!authLoading && user) {
            loadTrash()
        }
    }, [user, authLoading, loadTrash])

    const isEmpty = items.files.length === 0 && items.folders.length === 0

    if (authLoading || (loading && isEmpty)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground animate-pulse">Emptying the bin...</p>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <Trash2 className="h-8 w-8 text-destructive" />
                    Trash
                </h1>
                <p className="text-sm text-muted-foreground">
                    Items in trash will be automatically deleted after 30 days (coming soon).
                </p>
            </div>

            <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-2xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-destructive">Trash Management</p>
                    <p className="text-xs text-destructive/80 leading-relaxed">
                        Permanent deletion and restoration are currently disabled.
                        Items shown here are safely stored in the bin.
                    </p>
                </div>
            </div>

            <div className="h-px bg-border/40 w-full" />

            {isEmpty ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/10 rounded-3xl bg-muted/20">
                    <div className="p-5 bg-background border border-border/40 rounded-3xl mb-4 shadow-sm">
                        <Trash2 className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Trash is empty</h3>
                    <p className="text-sm text-muted-foreground/60 max-w-[200px]">Any items you delete will appear here.</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {items.folders.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Folders</h2>
                                <div className="h-px bg-border/10 flex-1" />
                            </div>
                            <FolderList folders={items.folders} onRefresh={loadTrash} onFolderClick={() => { }} />
                        </div>
                    )}

                    {items.files.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Files</h2>
                                <div className="h-px bg-border/10 flex-1" />
                            </div>
                            <FileList files={items.files} onRefresh={loadTrash} />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
