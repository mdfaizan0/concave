"use client"
import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { accessPublicLink } from "@/api/publiclinks.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Download, Lock, Folder, File, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PublicFolderPage() {
    const { token } = useParams()
    const [loading, setLoading] = useState(true)
    const [folderData, setFolderData] = useState(null)
    const [error, setError] = useState(null)
    const [password, setPassword] = useState("")
    const [needsPassword, setNeedsPassword] = useState(false)

    useEffect(() => {
        loadLink()
    }, [token])

    const loadLink = async (pwd = null) => {
        setLoading(true)
        setError(null)
        try {
            const data = await accessPublicLink(token, pwd)
            if (data.type !== "folder") {
                throw new Error("Invalid link type")
            }
            setFolderData(data)
            setNeedsPassword(false)
        } catch (err) {
            if (err.message === "Invalid password" || err.response?.status === 403) {
                setNeedsPassword(true)
                if (pwd) setError("Incorrect password")
            } else {
                setError(err.message || "Failed to load link")
            }
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordSubmit = (e) => {
        e.preventDefault()
        loadLink(password)
    }

    if (loading && !folderData && !needsPassword) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground animate-pulse">Opening folder...</p>
                </div>
            </div>
        )
    }

    if (error && !needsPassword) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="text-center space-y-4 max-w-md">
                    <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold">Link Unavailable</h1>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    if (needsPassword) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-sm space-y-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Password Required</h1>
                        <p className="text-muted-foreground">This folder is protected.</p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Enter password..."
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="h-11 text-center"
                                autoFocus
                            />
                            {error && <p className="text-xs text-destructive text-center">{error}</p>}
                        </div>
                        <Button type="submit" className="w-full h-11 font-bold" disabled={!password}>
                            Access Folder
                        </Button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col p-4 md:p-8 relative">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[60px_60px] pointer-events-none" />

            <div className="max-w-5xl mx-auto w-full z-10 flex flex-col h-full gap-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/40">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <Folder className="w-6 h-6" />
                            <span className="text-xs font-bold uppercase tracking-widest">Shared Folder</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            {folderData.name}
                        </h1>
                    </div>
                    <div className="px-4 py-2 bg-muted/30 rounded-full border border-border/50 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        secure view-only access
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 bg-card/50 border border-border/40 rounded-3xl shadow-xl overflow-hidden min-h-[500px]">
                    <div className="p-2 md:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Folders */}
                        {folderData.children.folders.map(folder => (
                            <div key={folder.id} className="p-4 bg-background/60 border border-border/40 rounded-xl flex items-center gap-3 opacity-75 cursor-not-allowed">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Folder className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate text-sm">{folder.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">Folder</p>
                                </div>
                                <div className="bg-muted px-2 py-0.5 rounded text-[9px] font-bold text-muted-foreground uppercase">Empty</div>
                            </div>
                        ))}

                        {/* Files */}
                        {folderData.children.files.map(file => (
                            <div key={file.id} className="p-3 bg-background border border-border/40 rounded-xl flex items-center gap-3 group hover:border-primary/30 transition-colors">
                                <div className="p-2 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                                    <File className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate text-sm">{file.name}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                                    onClick={() => window.open(file.url, '_blank')}
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}

                        {folderData.children.folders.length === 0 && folderData.children.files.length === 0 && (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground gap-4">
                                <Folder className="w-12 h-12 opacity-20" />
                                <p className="font-medium text-sm">This folder is empty</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="text-center py-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">
                        Powered by Concave
                    </p>
                </div>
            </div>
        </div>
    )
}
