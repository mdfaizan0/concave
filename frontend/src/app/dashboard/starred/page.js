"use client"

import React, { useEffect, useState } from "react"
import { fetchStarred } from "@/api/stars.api"
import { searchResources } from "@/api/search.api"
import { FolderList } from "@/components/folders/FolderList"
import { FileList } from "@/components/files/FileList"
import { Star, Loader2, LayoutGrid } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function StarredPage() {
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState({ files: [], folders: [] })
    const router = useRouter()

    const loadStarred = async () => {
        setLoading(true)
        try {
            const [starredData, allResources] = await Promise.all([
                fetchStarred(),
                searchResources("") // Fetch all resources to hydrate metadata
            ])

            const starredFileIds = new Set(starredData.filter(i => i.resource_type === "file").map(i => i.resource_id))
            const starredFolderIds = new Set(starredData.filter(i => i.resource_type === "folder").map(i => i.resource_id))

            const starredFiles = allResources.files.filter(f => starredFileIds.has(f.id)).map(f => ({ ...f, is_starred: true }))
            const starredFolders = allResources.folders.filter(f => starredFolderIds.has(f.id)).map(f => ({ ...f, is_starred: true }))

            setItems({
                files: starredFiles,
                folders: starredFolders
            })
        } catch (error) {
            console.error("Failed to load starred items", error)
            toast.error("Failed to load starred items")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStarred()
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
                <div className="bg-amber-500/10 p-6 rounded-full">
                    <Star className="w-10 h-10 text-amber-500" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold">No starred items</h3>
                    <p className="text-sm opacity-70">Star files and folders for quick access.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Starred</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Favorites</p>
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
                        onFolderClick={(folder) => router.push(`/dashboard?folderId=${folder.id}`)}
                        onRefresh={loadStarred}
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
                        onRefresh={loadStarred}
                    />
                </div>
            )}
        </div>
    )
}
