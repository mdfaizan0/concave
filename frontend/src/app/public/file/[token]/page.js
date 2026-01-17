"use client"
import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { accessPublicLink } from "@/api/publiclinks.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Download, Lock, FileText, AlertCircle } from "lucide-react"
import { downloadHandler } from "@/utils/downloadHandler"
import { toast } from "sonner"

export default function PublicFilePage() {
    const { token } = useParams()
    const [loading, setLoading] = useState(true)
    const [fileData, setFileData] = useState(null)
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
            setFileData(data)
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

    const handleDownload = async (e) => {
        if (e) e.stopPropagation();
        try {
            const error = await downloadHandler(fileData.url, fileData.name);
            if (error) {
                toast.error(error.response?.data?.message || error.message || "Download failed");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Download failed");
        }
    }

    if (loading && !fileData && !needsPassword) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground animate-pulse">Resolving link...</p>
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
                        <p className="text-muted-foreground">This link is protected.</p>
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
                            Access File
                        </Button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[60px_60px]" />
            <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-background via-background/80 to-transparent" />

            <div className="relative z-10 w-full max-w-lg bg-card border border-border/50 shadow-2xl rounded-3xl p-8 md:p-12 text-center space-y-8">

                <div className="space-y-6">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-4xl flex items-center justify-center shadow-inner border border-primary/20">
                        <FileText className="w-10 h-10 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground wrap-break-word">
                            {fileData.name}
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                            <Shield className="w-3.5 h-3.5" />
                            Secure Public Share
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 text-xs text-muted-foreground leading-relaxed">
                    This file was shared publicly via Concave. You have <strong>viewer-only</strong> access.
                    You can download the file securely below.
                </div>

                <Button
                    size="lg"
                    className="w-full h-14 text-base font-bold rounded-xl shadow-xl shadow-primary/20 gap-3 cursor-pointer"
                    onClick={handleDownload}
                >
                    <Download className="w-5 h-5" />
                    Download File
                </Button>

                <div className="pt-4 border-t border-border/30">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">
                        Powered by Concave
                    </p>
                </div>
            </div>
        </div>
    )
}
