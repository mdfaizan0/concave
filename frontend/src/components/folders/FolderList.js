"use client"

import React from "react"
import { FolderRow } from "./FolderRow"

export function FolderList({ folders, onFolderClick, onRefresh }) {
    if (!folders || folders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/10 rounded-3xl bg-muted/20">
                <div className="p-5 bg-background border border-border/40 rounded-3xl mb-4 shadow-sm">
                    <svg className="w-10 h-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor font-light">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold tracking-tight">Your vault is empty</h3>
                <p className="text-sm text-muted-foreground/60 max-w-[200px]">Create your first folder to start organizing your files.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder) => (
                <FolderRow
                    key={folder.id}
                    folder={folder}
                    onClick={onFolderClick}
                    onActionComplete={onRefresh}
                />
            ))}
        </div>
    )
}
