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
import { MoreVertical, Pencil, Trash2, FolderInput, Share2, Star } from "lucide-react"
import { renameFolder, trashFolder } from "@/api/folders.api"
import { starResource, unstarResource } from "@/api/stars.api"
import { toast } from "sonner"
import { MoveSelectorDialog } from "../files/MoveSelectorDialog"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { ShareDialog } from "../share/ShareDialog"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu"
import * as permissions from "@/utils/permissions"

export function FolderActions({ folder, onActionComplete, children }) {
    const { user } = useAuth()
    const [renameOpen, setRenameOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [moveOpen, setMoveOpen] = useState(false)
    const [shareOpen, setShareOpen] = useState(false)
    const [newName, setNewName] = useState(folder.name)
    const [loading, setLoading] = useState(false)
    const [isStarred, setIsStarred] = useState(folder.is_starred || false)

    const handleStar = async (e) => {
        if (e) e.stopPropagation();
        try {
            if (isStarred) {
                await unstarResource("folder", folder.id)
                toast.success(`Unstarred ${folder.name}`)
            } else {
                await starResource("folder", folder.id)
                toast.success(`Starred ${folder.name}`)
            }
            setIsStarred(!isStarred)
            onActionComplete?.()
        } catch (error) {
            toast.error(error.message || "Failed to update star")
        }
    }

    const handleShare = (e) => {
        if (e) e.stopPropagation();
        setShareOpen(true);
    }

    const handleRename = async (e) => {
        e.preventDefault()
        if (!newName.trim() || newName === folder.name) {
            setRenameOpen(false)
            return
        }

        setLoading(true)
        try {
            await renameFolder(folder.id, newName.trim())
            toast.success("Folder renamed")
            setRenameOpen(false)
            onActionComplete()
        } catch (error) {
            toast.error(error.message || "Failed to rename")
        } finally {
            setLoading(false)
        }
    }

    const handleMove = async (newParentId) => {
        setLoading(true)
        try {
            await renameFolder(folder.id, null, newParentId)
            toast.success("Folder moved")
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
            await trashFolder(folder.id)
            toast.success("Folder moved to trash")
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

        const canRename = permissions.canRename(folder, user?.id)
        const canMove = permissions.canMove(folder, user?.id)
        const canDelete = permissions.canDelete(folder, user?.id)
        const canShare = permissions.canShare(folder, user?.id)
        const canStar = permissions.canStar(folder, user?.id)

        return (
            <>
                {canRename && (
                    <Item onClick={(e) => { e.stopPropagation(); setRenameOpen(true); }} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Rename
                    </Item>
                )}
                {canShare && (
                    <Item onClick={handleShare} className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                    </Item>
                )}
                {canMove && (
                    <Item onClick={(e) => { e.stopPropagation(); setMoveOpen(true); }} className="gap-2">
                        <FolderInput className="h-4 w-4" />
                        Move to...
                    </Item>
                )}
                {canStar && (
                    <Item onClick={handleStar} className="gap-2 text-primary focus:text-primary focus:bg-primary/10 transition-colors">
                        <Star className={cn("h-4 w-4 transition-transform active:scale-95", isStarred && "fill-primary")} />
                        <span className="flex-1 font-semibold">{isStarred ? "Unstar" : "Star"}</span>
                    </Item>
                )}
                {canDelete && (
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

            <ShareDialog
                open={shareOpen}
                onOpenChange={setShareOpen}
                resource={folder}
                resourceType="folder"
            />

            <MoveSelectorDialog
                open={moveOpen}
                onOpenChange={setMoveOpen}
                onMove={handleMove}
                currentParentId={folder.parent_id}
                itemType="folder"
                itemId={folder.id}
            />

            {/* Rename Dialog */}
            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleRename}>
                        <DialogHeader>
                            <DialogTitle>Rename Folder</DialogTitle>
                            <DialogDescription>
                                Enter a new name for this folder.
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
                                    maxLength={60}
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
                            This will move "{folder.name}" and all its contents to the trash.
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
