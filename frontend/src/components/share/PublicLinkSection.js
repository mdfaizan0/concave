import React, { useState } from "react"
import { link, Globe, Copy, Check, Trash2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createPublicLink, revokePublicLink } from "@/api/publiclinks.api"
import { toast } from "sonner"

export function PublicLinkSection({ resourceId, resourceType }) {
    const [linkData, setLinkData] = useState(null)
    const [publicLink, setPublicLink] = useState(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCreateLink = async () => {
        setLoading(true)
        try {
            const linkData = await createPublicLink({ resource_id: resourceId, resource_type: resourceType })
            const urlType = resourceType === "folder" ? "folder" : "file"
            const fullUrl = `${window.location.origin}/public/${urlType}/${linkData.token}`
            setPublicLink(fullUrl)
            setLinkData(linkData)
            toast.success("Public link generated")
        } catch (error) {
            toast.error(error.message || "Failed to create public link")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!publicLink) return
        navigator.clipboard.writeText(publicLink)
        setCopied(true)
        toast.success("Link copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleRevokeLink = async () => {
        setLoading(true)
        try {
            await revokePublicLink(linkData.token)
            setPublicLink(null)
            toast.success("Public link revoked")
        } catch (error) {
            toast.error(error.message || "Failed to revoke public link")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">General access</span>
            </div>

            {!publicLink ? (
                <div className="bg-muted/30 border border-border/40 rounded-2xl p-4 flex flex-col items-center gap-3 text-center">
                    <div className="p-3 bg-background rounded-full border border-border/60">
                        <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold">No public link yet</h4>
                        <p className="text-[11px] text-muted-foreground max-w-[200px]">
                            Anyone with the link will be able to view and download this file/folder.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleCreateLink}
                        disabled={loading}
                        className="rounded-xl h-9 px-6 font-bold"
                    >
                        {loading ? "Generating..." : "Create Public Link"}
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            value={publicLink}
                            readOnly
                            className="bg-secondary/30 border-none font-mono text-[10px] h-10 select-all"
                        />
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={copyToClipboard}
                            className="shrink-0 h-10 w-10 rounded-xl"
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between px-3 py-2 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase">Public access enabled</span>
                        </div>
                        <Button onClick={handleRevokeLink} variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-destructive">
                            Revoke access
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
