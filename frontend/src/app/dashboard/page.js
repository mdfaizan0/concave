"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/folders/Breadcrumbs"
import { FolderList } from "@/components/folders/FolderList"
import { NewFolderDialog } from "@/components/folders/NewFolderDialog"
import { FileList } from "@/components/files/FileList"
import { fetchFolderById, fetchAllFolders } from "@/api/folders.api"
import { fetchFiles } from "@/api/files.api"
import { Folder, Upload, FolderPlus } from "lucide-react"
import { useUpload } from "@/context/UploadContext"
import { UploadDropzone } from "@/components/files/UploadDropzone"
import { UploadQueue } from "@/components/files/UploadQueue"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import * as permissions from "@/utils/permissions"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get("folderId")
  const { user, loading: authLoading } = useAuth()

  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [path, setPath] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentFolder, setCurrentFolder] = useState(null)
  const [newFolderOpen, setNewFolderOpen] = useState(false)

  const { addUploads } = useUpload()
  const fileInputRef = React.useRef(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      addUploads(e.target.files, folderId)
      // reset input
      e.target.value = ""
    }
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    setFolders([])
    setFiles([])
    try {
      if (folderId) {
        // Fetch specific folder, its children folders and path
        const folderData = await fetchFolderById(folderId)
        setCurrentFolder(folderData.folder)
        setFolders(folderData.children.folders)
        setPath(folderData.path)

        // Fetch files for this folder
        const filesData = await fetchFiles(folderId)
        setFiles(filesData)
      } else {
        // Fetch root folders
        setCurrentFolder(null)
        const rootFolders = await fetchAllFolders(null)
        setFolders(rootFolders)
        setPath([{ id: null, name: "My Drive" }])

        // Fetch root files
        const rootFiles = await fetchFiles(null)
        setFiles(rootFiles)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Error loading items")
      if (folderId) router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }, [folderId, router])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!authLoading && user) {
      loadData()
    }
  }, [user?.id, authLoading, loadData])

  useEffect(() => {
    const handleUploadSuccess = (e) => {
      const { folderId: uploadedFolderId } = e.detail
      // If we're in the same folder as the upload (or both are null/root)
      if (String(uploadedFolderId) === String(folderId)) {
        loadData()
      }
    }

    window.addEventListener("concave-upload-success", handleUploadSuccess)
    return () => window.removeEventListener("concave-upload-success", handleUploadSuccess)
  }, [folderId, loadData])

  const handleFolderClick = (id) => {
    router.push(`/dashboard?folderId=${id}`)
  }

  const handleBreadcrumbClick = (id) => {
    if (id) {
      router.push(`/dashboard?folderId=${id}`)
    } else {
      router.push("/dashboard")
    }
  }

  const isEmpty = folders.length === 0 && files.length === 0

  if (authLoading || (loading && folders.length === 0 && files.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground animate-pulse">
          {authLoading ? "Initializing..." : "Reading directory..."}
        </p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      <UploadDropzone folderId={folderId} />
      <UploadQueue />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      <ContextMenu>
        <ContextMenuTrigger>
          <div className="p-6 lg:p-10 space-y-8 max-w-full mx-auto min-h-[calc(100vh-120px)]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-black tracking-tight">
                  {folderId ? path[path.length - 1]?.name : "My Drive"}
                </h1>
                <Breadcrumbs path={path} onNavigate={handleBreadcrumbClick} />
              </div>

              {permissions.canCreate(currentFolder, user?.id) && (
                <NewFolderDialog parentId={folderId} onFolderCreated={loadData} />
              )}
            </div>

            <div className="h-px bg-border/40 w-full" />

            {isEmpty ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/10 rounded-3xl bg-muted/20">
                <div className="p-5 bg-background border border-border/40 rounded-3xl mb-4 shadow-sm">
                  <Folder />
                </div>
                <h3 className="text-xl font-bold tracking-tight">This directory is empty</h3>
                <p className="text-sm text-muted-foreground/60 max-w-[200px]">Start by creating a folder or uploading files.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {folders.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Folders</h2>
                      <div className="h-px bg-border/10 flex-1" />
                    </div>
                    <FolderList
                      folders={folders}
                      onFolderClick={handleFolderClick}
                      onRefresh={loadData}
                    />
                  </div>
                )}

                <FileList
                  files={files}
                  onRefresh={loadData}
                />
              </div>
            )}
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-64 p-1.5 rounded-2xl shadow-2xl border-border/60 bg-background/95 backdrop-blur-xl">
          {permissions.canCreate(currentFolder, user?.id) && (
            <>
              <ContextMenuItem
                onClick={handleUploadClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors font-medium text-sm"
              >
                <Upload className="h-4 w-4" />
                Upload File
              </ContextMenuItem>
              <ContextMenuSeparator className="my-1.5 bg-border/40" />
              <ContextMenuItem
                onClick={() => setNewFolderOpen(true)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors font-medium text-sm"
              >
                <FolderPlus className="h-4 w-4" />
                New Folder
              </ContextMenuItem>
            </>
          )}
          {!permissions.canCreate(currentFolder, user?.id) && (
            <div className="px-3 py-2 text-xs text-muted-foreground italic">
              You don't have permission to upload here
            </div>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Invisible Dialog for Context Menu Trigger */}
      <NewFolderDialog
        parentId={folderId}
        onFolderCreated={loadData}
        open={newFolderOpen}
        setOpen={setNewFolderOpen}
        showTrigger={false}
      />
    </div>
  )
}