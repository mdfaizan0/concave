import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Users, Globe, UserPlus, Shield, X, AlertCircle } from "lucide-react";
import { createShare, listShares, revokeShare, updateShareRole } from "@/api/shares.api";
import { ShareUserRow } from "./ShareUserRow";
import { PublicLinkSection } from "./PublicLinkSection";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ShareDialog({ open, onOpenChange, resource, resourceType }) {
    const { user } = useAuth();
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [email, setEmail] = useState("");
    const [activeTab, setActiveTab] = useState("people"); // "people" or "public"

    const loadShares = useCallback(async () => {
        if (!resource?.id) return;
        setLoading(true);
        try {
            const data = await listShares(resourceType, resource.id);
            setShares(data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to load collaborators");
        } finally {
            setLoading(false);
        }
    }, [resource, resourceType]);

    useEffect(() => {
        if (open && resource) {
            loadShares();
        }
    }, [open, resource, loadShares]);

    const handleAddShare = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setInviting(true);
        try {
            await createShare({
                resource_type: resourceType,
                resource_id: resource.id,
                email: email.trim(),
                role: "viewer"
            });
            toast.success("Collaborator added");
            setEmail("");
            loadShares();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to invite user. Ensure email is registered.");
        } finally {
            setInviting(false);
        }
    };

    const handleUpdateRole = async (shareId, newRole) => {
        try {
            await updateShareRole(shareId, newRole);
            toast.success("Role updated");
            loadShares();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to update role");
        }
    };

    const handleRevokeShare = async (shareId) => {
        try {
            await revokeShare(shareId);
            toast.success("Access revoked");
            loadShares();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to revoke access");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl">
                <div className="p-6 pb-4 space-y-4">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20">
                                <Share2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                    Share "{resource?.name}"
                                </DialogTitle>
                                <DialogDescription className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                                    {resourceType} sharing settings
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Tabs */}
                    <div className="flex p-1 bg-muted/40 rounded-2xl border border-border/50">
                        <button
                            onClick={() => setActiveTab("people")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "people"
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:bg-muted/60"
                                }`}
                        >
                            <Users className="h-3.5 w-3.5" />
                            People
                        </button>
                        <button
                            onClick={() => setActiveTab("public")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "public"
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:bg-muted/60"
                                }`}
                        >
                            <Globe className="h-3.5 w-3.5" />
                            Public Link
                        </button>
                    </div>
                </div>

                <div className="px-6 pb-6 min-h-[300px] max-h-[400px] overflow-hidden flex flex-col">
                    {activeTab === "people" ? (
                        <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
                            {/* Invite Input */}
                            <form onSubmit={handleAddShare} className="flex gap-2 mt-2">
                                <div className="relative flex-1">
                                    <Input
                                        type="email"
                                        placeholder="Enter email to invite..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 rounded-xl bg-muted/30 border-none pl-4 pr-4 transition-all focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/40"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={inviting || !email.trim()}
                                    className="h-11 rounded-xl px-5 font-bold gap-2 shadow-lg shadow-primary/20"
                                >
                                    {inviting ? "Inviting..." : "Invite"}
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            </form>

                            {/* Collaborator List */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex items-center justify-between mb-3 px-1 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                    <span>Who has access</span>
                                    <span>{shares.length + 1} people</span>
                                </div>

                                <ScrollArea className="flex-1 -mx-1 px-1">
                                    <div className="space-y-1">
                                        {/* Owner Row (Fixed) */}
                                        <div className="flex items-center justify-between py-3 px-1">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                                    <Shield className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold truncate max-w-[150px]">
                                                        {user?.id === resource?.owner_id ? "You (Owner)" : "The Owner"}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                        Owner
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {shares.map((share) => (
                                            <ShareUserRow
                                                key={share.id}
                                                share={share}
                                                onUpdateRole={(role) => handleUpdateRole(share.id, role)}
                                                onRevoke={() => handleRevokeShare(share.id)}
                                            />
                                        ))}

                                        {loading && shares.length === 0 && (
                                            <div className="py-8 flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Loading list...</span>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            <PublicLinkSection resourceId={resource?.id} resourceType={resourceType} />
                        </div>
                    )}
                </div>

                <Separator className="bg-border/40" />
                <DialogFooter className="p-4 bg-muted/20">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-bold text-xs"
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
