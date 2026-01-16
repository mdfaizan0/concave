"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { X, RefreshCcw, CheckCircle2, AlertCircle, FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function UploadProgressItem({ name, progress, status, error, onRemove, onRetry }) {
    const isError = status === "error"
    const isSuccess = status === "success"
    const isUploading = status === "uploading"

    return (
        <div className="group relative bg-background/50 border border-border/20 rounded-2xl p-4 transition-all hover:border-border/40 hover:bg-background/80">
            <div className="flex items-start gap-4">
                <div className={cn(
                    "p-2.5 rounded-xl shrink-0 transition-colors",
                    isSuccess ? "bg-green-500/10 text-green-500" :
                        isError ? "bg-destructive/10 text-destructive" :
                            "bg-primary/10 text-primary"
                )}>
                    {isSuccess ? <CheckCircle2 className="h-4 w-4" /> :
                        isError ? <AlertCircle className="h-4 w-4" /> :
                            <FileIcon className="h-4 w-4" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold truncate pr-2">{name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isError && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onRetry}
                                    className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                                >
                                    <RefreshCcw className="h-3 w-3" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onRemove}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    {isUploading && (
                        <div className="space-y-2">
                            <Progress value={progress} className="h-1.5" />
                            <div className="flex justify-between text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                                <span>Uploading...</span>
                                <span>{progress}%</span>
                            </div>
                        </div>
                    )}

                    {isSuccess && (
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Complete</span>
                    )}

                    {isError && (
                        <span
                            className="text-[10px] font-bold text-destructive uppercase tracking-widest line-clamp-1"
                            title={error || "Upload failed"}
                        >
                            {error || "Upload failed"}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
