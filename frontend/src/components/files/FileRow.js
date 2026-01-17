"use client"

import React from "react"
import { File, FileText, FileImage, FileVideo, FileArchive, Music, Star } from "lucide-react"
import { FileActions } from "./FileActions"
import { fetchOneFile } from "@/api/files.api"
import { toast } from "sonner"
import { useStarred } from "@/context/StarredContext"

const getFileIcon = (mime) => {
    if (mime?.startsWith("image/")) return <FileImage className="h-6 w-6 text-blue-500 fill-blue-500/10" />
    if (mime?.startsWith("video/")) return <FileVideo className="h-6 w-6 text-purple-500 fill-purple-500/10" />
    if (mime?.startsWith("audio/")) return <Music className="h-6 w-6 text-pink-500 fill-pink-500/10" />
    if (mime?.includes("pdf") || mime?.includes("word") || mime?.includes("text")) return <FileText className="h-6 w-6 text-orange-500 fill-orange-500/10" />
    if (mime?.includes("zip") || mime?.includes("rar")) return <FileArchive className="h-6 w-6 text-yellow-600 fill-yellow-600/10" />
    return <File className="h-6 w-6 text-gray-400 fill-gray-400/10" />
}

const formatSize = (bytes) => {
    if (!bytes) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function FileRow({ file, onActionComplete }) {
    const { isStarred } = useStarred()
    const starred = isStarred("file", file.id)

    const handleDownload = async () => {
        try {
            const url = await fetchOneFile(file.id);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", file.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Download started");
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Download failed");
        }
    }

    return (
        <FileActions file={file} onActionComplete={onActionComplete}>
            <div
                onDoubleClick={handleDownload}
                title="Double click to download"
                className="group relative flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/40 cursor-pointer transition-all duration-200 border border-border/5 hover:border-border/40 hover:shadow-sm"
            >
                <div className="relative p-2.5 bg-background border border-border/10 rounded-xl group-hover:border-border/40 transition-colors">
                    {getFileIcon(file.mime_type)}
                    {starred && (
                        <div className="absolute -bottom-1 -right-1 p-0.5 bg-background shadow-sm rounded-full border border-border/10 z-10">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate group-hover:text-foreground transition-colors">
                        {file.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/40">
                            {file.mime_type?.split("/")[1] || "File"}
                        </p>
                        <span className="w-1 h-1 rounded-full bg-border/40" />
                        <p className="text-[10px] text-muted-foreground/60">
                            {formatSize(file.size_bytes)}
                        </p>
                    </div>
                </div>
            </div>
        </FileActions>
    )
}
