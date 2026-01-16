"use client"

import React from "react"
import { useUpload } from "@/context/UploadContext"
import { UploadProgressItem } from "./UploadProgressItem"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, X, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

export function UploadQueue() {
    const { uploads, isOpen, setIsOpen, retryUpload, removeUpload, clearCompleted } = useUpload()

    if (uploads.length === 0) return null

    const activeCount = uploads.filter(u => u.status === "uploading").length
    const hasCompleted = uploads.some(u => u.status === "success" || u.status === "error")

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 pointer-events-none">
            <AnimatePresence>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="pointer-events-auto bg-background/80 backdrop-blur-xl border border-border/40 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden"
                >
                    {/* Header */}
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center bg-primary/10",
                                activeCount > 0 && "animate-pulse"
                            )}>
                                {activeCount > 0 ? (
                                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                ) : (
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-foreground/80">
                                    {activeCount > 0 ? `Uploading ${activeCount} files` : "Uploads complete"}
                                </h4>
                                <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tight">
                                    {uploads.length} total tasks
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {hasCompleted && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); clearCompleted(); }}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* List Area */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                            >
                                <ScrollArea className="h-72 max-h-[60vh] p-4">
                                    <div className="space-y-3 pb-2">
                                        {uploads.map((upload) => (
                                            <UploadProgressItem
                                                key={upload.id}
                                                {...upload}
                                                onRemove={() => removeUpload(upload.id)}
                                                onRetry={() => retryUpload(upload.id)}
                                            />
                                        ))}
                                    </div>
                                </ScrollArea>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
