"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Folder, ChevronRight, Home, Check } from "lucide-react"
import { fetchAllFolders, fetchFolderById } from "@/api/folders.api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function MoveSelectorDialog({ open, onOpenChange, onMove, currentParentId, itemType, itemId }) {
    const [folders, setFolders] = useState([])
    const [path, setPath] = useState([{ id: null, name: "My Drive" }])
    const [loading, setLoading] = useState(false)
    const [selectedFolderId, setSelectedFolderId] = useState(currentParentId)

    const loadFolders = useCallback(async (parentId) => {
        setLoading(true)
        try {
            if (parentId) {
                const data = await fetchFolderById(parentId)
                setFolders(data.children.folders.filter(f => f.id !== itemId)) // Don't show the folder being moved
                setPath(data.path)
            } else {
                const data = await fetchAllFolders(null)
                setFolders(data.filter(f => f.id !== itemId))
                setPath([{ id: null, name: "My Drive" }])
            }
            setSelectedFolderId(parentId)
        } catch (error) {
            toast.error("Failed to load folders")
        } finally {
            setLoading(false)
        }
    }, [itemId])

    useEffect(() => {
        if (open) {
            loadFolders(currentParentId)
        }
    }, [open, currentParentId, loadFolders])

    const handleMove = () => {
        if (selectedFolderId === currentParentId) {
            onOpenChange(false)
            return
        }
        onMove(selectedFolderId)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Move to...</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-border/10 mb-2 no-scrollbar">
                    {path.map((p, i) => (
                        <React.Fragment key={p.id || "root"}>
                            <button
                                onClick={() => loadFolders(p.id)}
                                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 hover:text-primary transition-colors whitespace-nowrap"
                            >
                                {p.name}
                            </button>
                            {i < path.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />}
                        </React.Fragment>
                    ))}
                </div>

                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-1">
                        {folders.length === 0 && !loading && (
                            <div className="py-8 text-center text-xs text-muted-foreground/40 italic">
                                No subfolders here
                            </div>
                        )}

                        {folders.map((folder) => (
                            <div
                                key={folder.id}
                                onClick={() => loadFolders(folder.id)}
                                className={cn(
                                    "group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border border-transparent",
                                    selectedFolderId === folder.id ? "bg-primary/5 border-primary/20" : "hover:bg-secondary/40"
                                )}
                            >
                                <Folder className={cn(
                                    "h-4 w-4",
                                    selectedFolderId === folder.id ? "text-primary fill-primary/20" : "text-muted-foreground/40"
                                )} />
                                <span className="text-sm flex-1 truncate">{folder.name}</span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground/20" />
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleMove}
                        disabled={selectedFolderId === currentParentId || loading}
                        className="gap-2"
                    >
                        Move Here
                        <Check className="h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
