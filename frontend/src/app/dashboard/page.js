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
import { Folder } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get("folderId")
  const { user, loading: authLoading } = useAuth()

  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [path, setPath] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      if (folderId) {
        // Fetch specific folder, its children folders and path
        const folderData = await fetchFolderById(folderId)
        setFolders(folderData.children.folders)
        setPath(folderData.path)

        // Fetch files for this folder
        const filesData = await fetchFiles(folderId)
        setFiles(filesData)
      } else {
        // Fetch root folders
        const rootFolders = await fetchAllFolders(null)
        setFolders(rootFolders)
        setPath([{ id: null, name: "My Drive" }])

        // Fetch root files
        const rootFiles = await fetchFiles(null)
        setFiles(rootFiles)
      }
    } catch (error) {
      toast.error(error.message || "Error loading items")
      if (folderId) router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }, [folderId, router])

  useEffect(() => {
    if (!authLoading && user) {
      loadData()
    }
  }, [user, authLoading, loadData])

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
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-black tracking-tight">
            {folderId ? path[path.length - 1]?.name : "My Drive"}
          </h1>
          <Breadcrumbs path={path} onNavigate={handleBreadcrumbClick} />
        </div>

        <NewFolderDialog parentId={folderId} onFolderCreated={loadData} />
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
  )
}