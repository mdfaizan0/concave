"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"
import { uploadFile } from "@/api/files.api"
import { toast } from "sonner"

const UploadContext = createContext(null)

export function UploadProvider({ children }) {
    const [uploads, setUploads] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const uploadsRef = useRef({}) // to track active requests for cleanup/retry

    const startUpload = useCallback(async (file, folderId) => {
        const uploadId = Math.random().toString(36).substring(7)

        const newUpload = {
            id: uploadId,
            name: file.name,
            file,
            folderId,
            progress: 0,
            status: "uploading",
            error: null
        }

        setUploads(prev => [newUpload, ...prev])
        setIsOpen(true)

        try {
            await uploadFile({
                file,
                folder_id: folderId,
                onProgress: (progress) => {
                    setUploads(prev => prev.map(u =>
                        u.id === uploadId ? { ...u, progress } : u
                    ))
                }
            })

            setUploads(prev => prev.map(u =>
                u.id === uploadId ? { ...u, status: "success", progress: 100 } : u
            ))

            // Dispatch custom event for real-time refresh
            window.dispatchEvent(new CustomEvent("concave-upload-success", {
                detail: { folderId }
            }))
        } catch (error) {
            setUploads(prev => prev.map(u =>
                u.id === uploadId ? { ...u, status: "error", error: error.message } : u
            ))
            toast.error(error.response?.data?.message || error.message || `Failed to upload ${file.name}`)
        }
    }, [])

    const addUploads = useCallback((files, folderId) => {
        Array.from(files).forEach(file => startUpload(file, folderId))
    }, [startUpload])

    const retryUpload = useCallback((uploadId) => {
        const upload = uploads.find(u => u.id === uploadId)
        if (!upload) return

        setUploads(prev => prev.filter(u => u.id !== uploadId))
        startUpload(upload.file, upload.folderId)
    }, [uploads, startUpload])

    const removeUpload = useCallback((uploadId) => {
        setUploads(prev => prev.filter(u => u.id !== uploadId))
    }, [])

    const clearCompleted = useCallback(() => {
        setUploads(prev => prev.filter(u => u.status === "uploading"))
    }, [])

    return (
        <UploadContext.Provider value={{
            uploads,
            addUploads,
            retryUpload,
            removeUpload,
            isOpen,
            setIsOpen,
            clearCompleted
        }}>
            {children}
        </UploadContext.Provider>
    )
}

export const useUpload = () => useContext(UploadContext)
