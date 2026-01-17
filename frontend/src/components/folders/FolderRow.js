"use client"

import React from "react"
import { Folder, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { FolderActions } from "./FolderActions"
import { useStarred } from "@/context/StarredContext"

export function FolderRow({ folder, onClick, onActionComplete }) {
    const { isStarred } = useStarred()
    const starred = isStarred("folder", folder.id)

    return (
        <FolderActions folder={folder} onActionComplete={onActionComplete}>
            <div
                onClick={() => onClick(folder.id)}
                className="group relative flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/60 cursor-pointer transition-all duration-200 border border-border/10 hover:border-border/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onClick(folder.id)
                    }
                }}
            >
                <div className="relative p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Folder className="h-6 w-6 text-primary fill-primary/30 group-hover:fill-primary/40" />
                    {starred && (
                        <div className="absolute -bottom-1 -right-1 p-0.5 bg-background shadow-sm rounded-full border border-border/10 z-10">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {folder.name}
                    </h3>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">
                        Folder
                    </p>
                </div>
            </div>
        </FolderActions>
    )
}
