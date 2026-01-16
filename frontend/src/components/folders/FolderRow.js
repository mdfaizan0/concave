"use client"

import React from "react"
import { Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import { FolderActions } from "./FolderActions"

export function FolderRow({ folder, onClick, onActionComplete }) {
    return (
        <FolderActions folder={folder} onActionComplete={onActionComplete}>
            <div
                onClick={() => onClick(folder.id)}
                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/60 cursor-pointer transition-all duration-200 border border-border/10 hover:border-border/60 hover:shadow-sm"
            >
                <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Folder className="h-6 w-6 text-primary fill-primary/30 group-hover:fill-primary/40" />
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
