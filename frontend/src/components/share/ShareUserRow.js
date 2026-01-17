import React from "react"
import { User, Shield, ShieldCheck, Trash2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ShareUserRow({ share, onUpdateRole, onRevoke }) {
    const isOwner = share.role === "owner"

    return (
        <div className="flex items-center justify-between py-3 px-1 hover:bg-muted/50 rounded-xl transition-colors group">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold truncate max-w-[150px]">
                        {share.user_email || `User ${share.user_id.slice(0, 8)}`}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        {share.role}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                {!isOwner && (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-xs font-semibold">
                                    {share.role === "editor" ? (
                                        <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                                    ) : (
                                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                    <span className="capitalize">{share.role}</span>
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32 rounded-xl">
                                <DropdownMenuItem onClick={() => onUpdateRole("viewer")} className="gap-2">
                                    <Shield className="h-4 w-4" />
                                    Viewer
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onUpdateRole("editor")} className="gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Editor
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onRevoke}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}
