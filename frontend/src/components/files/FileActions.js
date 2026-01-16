"use client"

import React, { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreVertical, Pencil, Trash2, Download, FolderInput, Share2, Star } from "lucide-react"
import { renameFile, trashFile, fetchOneFile } from "@/api/files.api"
import { starResource, unstarResource } from "@/api/stars.api"
import { toast } from "sonner"
import { MoveSelectorDialog } from "./MoveSelectorDialog"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu"

export function FileActions({ file, onActionComplete, children }) {
    const { user } = useAuth()
    const [renameOpen, setRenameOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [moveOpen, setMoveOpen] = useState(false)
    const [newName, setNewName] = useState(file.name)
    const [loading, setLoading] = useState(false)
    const [isStarred, setIsStarred] = useState(file.is_starred || false)

    const canEdit = user?.id === file.owner_id

    const handleStar = async (e) => {
        if (e) e.stopPropagation();
        try {
            if (isStarred) {
                await unstarResource("file", file.id)
                toast.success(`Unstarred ${file.name}`)
            } else {
                await starResource("file", file.id)
                toast.success(`Starred ${file.name}`)
            }
            setIsStarred(!isStarred)
            onActionComplete?.()
        } catch (error) {
            toast.error(error.message || "Failed to update star")
        }
    }

    const handleShare = (e) => {
        if (e) e.stopPropagation();
        toast.info("Sharing feature coming soon")
    }

    const handleDownload = async (e) => {
        if (e) e.stopPropagation();
        try {
            const url = await fetchOneFile(file.id);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", file.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Download started");
        } catch (error) {
            toast.error(error.message || "Download failed");
        }
    }

    const handleRename = async (e) => {
        e.preventDefault()
        if (!newName.trim() || newName === file.name) {
            setRenameOpen(false)
            return
        }

        setLoading(true)
        try {
            await renameFile(file.id, newName.trim())
            toast.success("File renamed")
            setRenameOpen(false)
            onActionComplete()
        } catch (error) {
            toast.error(error.message || "Failed to rename")
        } finally {
            setLoading(false)
        }
    }

    const handleMove = async (newFolderId) => {
        setLoading(true)
        try {
            await renameFile(file.id, null, newFolderId)
            toast.success("File moved")
            onActionComplete()
        } catch (error) {
            toast.error(error.message || "Failed to move")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            await trashFile(file.id)
            toast.success("File moved to trash")
            setDeleteOpen(false)
            onActionComplete()
        } catch (error) {
            toast.error(error.message || "Failed to delete")
        } finally {
            setLoading(false)
        }
    }

    const menuItems = (Type) => {
        const Item = Type === "dropdown" ? DropdownMenuItem : ContextMenuItem
        const Separator = Type === "dropdown" ? DropdownMenuSeparator : ContextMenuSeparator

        return (
            <>
                <Item onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                </Item>
                {canEdit && (
                    <Item onClick={(e) => { e.stopPropagation(); setRenameOpen(true); }} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Rename
                    </Item>
                )}
                <Separator />
                <Item onClick={handleShare} className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                </Item>
                <Item onClick={handleStar} className="gap-2 text-primary focus:text-primary focus:bg-primary/10 transition-colors">
                    <Star className={cn("h-4 w-4 transition-transform active:scale-95", isStarred && "fill-primary")} />
                    <span className="flex-1 font-semibold">{isStarred ? "Unstar" : "Star"}</span>
                </Item>
                {canEdit && (
                    <Item onClick={(e) => { e.stopPropagation(); setMoveOpen(true); }} className="gap-2">
                        <FolderInput className="h-4 w-4" />
                        Move to...
                    </Item>
                )}
                {canEdit && (
                    <>
                        <Separator />
                        <Item
                            onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
                            className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 font-bold"
                        >
                            <Trash2 className="h-4 w-4" />
                            Dump into Trash
                        </Item>
                    </>
                )}
            </>
        )
    }

    // Injected dropdown menu button
    const actionTrigger = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1.5 rounded-2xl shadow-2xl border-border/60 bg-background/95 backdrop-blur-xl">
                {menuItems("dropdown")}
            </DropdownMenuContent>
        </DropdownMenu>
    )

    // Clone children and inject the trigger at the end of its content
    const clonedTrigger = React.cloneElement(children, {
        children: (
            <>
                {children.props.children}
                {actionTrigger}
            </>
        )
    })

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {clonedTrigger}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64 p-1.5 rounded-2xl shadow-2xl border-border/60 bg-background/95 backdrop-blur-xl">
                {menuItems("context")}
            </ContextMenuContent>

            <MoveSelectorDialog
                open={moveOpen}
                onOpenChange={setMoveOpen}
                onMove={handleMove}
                currentParentId={file.folder_id}
                itemType="file"
                itemId={file.id}
            />

            {/* Rename Dialog */}
            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleRename}>
                        <DialogHeader>
                            <DialogTitle>Rename File</DialogTitle>
                            <DialogDescription>
                                Enter a new name for this file.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="rename">Name</Label>
                                <Input
                                    id="rename"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    autoFocus
                                    required
                                    minLength={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setRenameOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || newName.trim().length < 3}>
                                {loading ? "Renaming..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will move "{file.name}" to the trash.
                            You can restore it later from the Trash folder.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            disabled={loading}
                        >
                            {loading ? "Trashing..." : "Move to Trash"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ContextMenu>
    )
}
