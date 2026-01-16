"use client"

import React from "react"
import { FileRow } from "./FileRow"

export function FileList({ files, onRefresh }) {
    if (!files || files.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Files</h2>
                <div className="h-px bg-border/10 flex-1" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                    <FileRow
                        key={file.id}
                        file={file}
                        onActionComplete={onRefresh}
                    />
                ))}
            </div>
        </div>
    )
}
