"use client"

import React, { useState, useEffect } from "react"
import { useUpload } from "@/context/UploadContext"
import { Upload, FilePlus, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

export function UploadDropzone({ folderId }) {
    const [isDragging, setIsDragging] = useState(false)
    const { addUploads } = useUpload()

    useEffect(() => {
        const handleDragOver = (e) => {
            e.preventDefault()
            setIsDragging(true)
        }

        const handleDragLeave = (e) => {
            e.preventDefault()
            // Only set to false if we are actually leaving the window
            if (e.clientX === 0 && e.clientY === 0) {
                setIsDragging(false)
            }
        }

        const handleDrop = (e) => {
            e.preventDefault()
            setIsDragging(false)
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                addUploads(e.dataTransfer.files, folderId)
            }
        }

        window.addEventListener("dragover", handleDragOver)
        window.addEventListener("dragleave", handleDragLeave)
        window.addEventListener("drop", handleDrop)

        return () => {
            window.removeEventListener("dragover", handleDragOver)
            window.removeEventListener("dragleave", handleDragLeave)
            window.removeEventListener("drop", handleDrop)
        }
    }, [addUploads, folderId])

    return (
        <AnimatePresence>
            {isDragging && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-100 p-6 pointer-events-none"
                >
                    <div className="w-full h-full bg-primary/3 backdrop-blur-md rounded-3xl border-4 border-dashed border-primary/30 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
                        {/* Animated background rings */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                            <div className="w-[500px] h-[500px] rounded-full border border-primary animate-[ping_3s_linear_infinite]" />
                            <div className="absolute w-[300px] h-[300px] rounded-full border border-primary animate-[ping_2s_linear_infinite]" />
                        </div>

                        <div className="relative">
                            <div className="bg-primary/10 p-8 rounded-[2.5rem] relative z-10">
                                <Upload className="h-16 w-16 text-primary animate-bounce" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-background border border-border p-2 rounded-2xl shadow-xl z-20">
                                <FilePlus className="h-6 w-6 text-primary" />
                            </div>
                        </div>

                        <div className="text-center space-y-4 max-w-sm relative z-10 px-6">
                            <h2 className="text-4xl font-black tracking-tight uppercase">Drop to Concave</h2>
                            <p className="text-muted-foreground/60 text-lg font-medium leading-relaxed">
                                Release your files here to instantly upload them to your drive.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border/40 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 relative z-10">
                            <ShieldCheck className="h-3 w-3" />
                            End-to-end encrypted transfer
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
