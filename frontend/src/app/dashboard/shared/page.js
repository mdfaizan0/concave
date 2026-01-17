"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { fetchSharedWithMe } from "@/api/shares.api"
import { FolderList } from "@/components/folders/FolderList"
import { FileList } from "@/components/files/FileList"
import { LayoutGrid, Share2 } from "lucide-react"
import { toast } from "sonner"

export default function SharedPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [files, setFiles] = useState([])
    const [folders, setFolders] = useState([])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login")
        }
    }, [user, authLoading, router])

    const loadSharedItems = async () => {
        if (!user) return
        setLoading(true)
        try {
            const data = await fetchSharedWithMe()
            setFiles(data.files || [])
            setFolders(data.folders || [])
        } catch (error) {
            console.error("Failed to load shared items:", error)
            toast.error(error.response?.data?.message || error.message || "Failed to load shared items")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            loadSharedItems()
        }
    }, [user])

    if (authLoading || (loading && !files.length && !folders.length)) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!loading && files.length === 0 && folders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground gap-4">
                <div className="bg-green-500/10 p-6 rounded-full">
                    <Share2 className="w-10 h-10 text-green-500" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold">No shared items</h3>
                    <p className="text-sm opacity-70">Items shared with you will appear here.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-xl">
                    <Share2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shared with me</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Collaboration</p>
                </div>
            </div>

            {folders.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b border-border/40 pb-2">
                        <LayoutGrid className="w-4 h-4" />
                        FOLDERS
                    </div>
                    <FolderList
                        folders={folders}
                        onFolderClick={(folder) => router.push(`/dashboard/folder/${folder.id}`)}
                        onRefresh={loadSharedItems}
                    />
                </div>
            )}

            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b border-border/40 pb-2">
                        <LayoutGrid className="w-4 h-4" />
                        FILES
                    </div>
                    <FileList
                        files={files}
                        onRefresh={loadSharedItems}
                    />
                </div>
            )}
        </div>
    )
}
