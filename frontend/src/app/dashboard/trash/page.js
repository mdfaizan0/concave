"use client"

import React, { useEffect, useState } from "react"
import { fetchTrash } from "@/api/files.api"
import { FolderList } from "@/components/folders/FolderList"
import { FileList } from "@/components/files/FileList"
import { Trash2, Loader2, LayoutGrid } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function TrashPage() {
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState({ files: [], folders: [] })
    const router = useRouter()

    const loadTrash = async () => {
        setLoading(true)
        try {
            const data = await fetchTrash()
            setItems(data)
        } catch (error) {
            console.error("Failed to load trash items", error)
            toast.error("Failed to load trash items")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTrash()
    }, [])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (items.files.length === 0 && items.folders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground gap-4">
                <div className="bg-primary/10 p-6 rounded-full">
                    <Trash2 className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Trash is empty</h3>
                    <p className="text-sm opacity-70">Items moved to trash will appear here.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <Trash2 className="w-5 h-5 text-primary fill-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Trash</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Deleted Items</p>
                </div>
            </div>

            {items.folders.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b border-border/40 pb-2">
                        <LayoutGrid className="w-4 h-4" />
                        FOLDERS
                    </div>
                    <FolderList
                        folders={items.folders}
                        onFolderClick={(folder) => {
                            // Can't navigate into deleted folder usually.
                            // Maybe disable click or show toast?
                            // For now, let's just do nothing or toast.
                            toast.error("Restore folder to view contents")
                        }}
                        onRefresh={loadTrash}
                    />
                </div>
            )}

            {items.files.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b border-border/40 pb-2">
                        <LayoutGrid className="w-4 h-4" />
                        FILES
                    </div>
                    <FileList
                        files={items.files}
                        onRefresh={loadTrash}
                    />
                </div>
            )}
        </div>
    )
}
