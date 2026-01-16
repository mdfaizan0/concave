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
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { renameFolder, trashFolder } from "@/api/folders.api"
import { toast } from "sonner"

export function FolderActions({ folder, onActionComplete }) {
    const [renameOpen, setRenameOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [newName, setNewName] = useState(folder.name)
    const [loading, setLoading] = useState(false)

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

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setRenameOpen(true);
                        }}
                        className="gap-2"
                    >
                        <Pencil className="h-4 w-4" />
                        Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteOpen(true);
                        }}
                        className="gap-2 text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                        Move to Trash
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

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
        </>
    )
}
