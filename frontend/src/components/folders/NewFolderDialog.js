"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createFolder } from "@/api/folders.api"
import { toast } from "sonner"

export function NewFolderDialog({ parentId, onFolderCreated, open: externalOpen, setOpen: externalSetOpen, showTrigger = true }) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = externalOpen !== undefined ? externalOpen : internalOpen
    const setOpen = (val) => {
        if (externalSetOpen) externalSetOpen(val)
        setInternalOpen(val)
    }

    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            await createFolder({ name: name.trim(), parent_id: parentId })
            toast.success("Folder created successfully")
            setName("")
            setOpen(false)
            onFolderCreated()
        } catch (error) {
            toast.error(error.message || "Failed to create folder")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {showTrigger && (
                <DialogTrigger asChild>
                    <Button className="font-semibold gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" />
                        New Folder
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New Folder</DialogTitle>
                        <DialogDescription>
                            Create a new folder to organize your files.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Folder name</Label>
                            <Input
                                id="name"
                                placeholder="Enter folder name..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                required
                                minLength={3}
                                maxLength={60}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || name.trim().length < 3}>
                            {loading ? "Creating..." : "Create Folder"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
