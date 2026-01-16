"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/folders/Breadcrumbs"
import { FolderList } from "@/components/folders/FolderList"
import { NewFolderDialog } from "@/components/folders/NewFolderDialog"
import { fetchFolderById, fetchAllFolders } from "@/api/folders.api"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get("folderId")
  const { user, loading: authLoading } = useAuth()

  const [folders, setFolders] = useState([])
  const [path, setPath] = useState([])
  const [loading, setLoading] = useState(true)

  const loadFolderData = useCallback(async () => {
    setLoading(true)
    try {
      if (folderId) {
        // Fetch specific folder and its path
        const data = await fetchFolderById(folderId)
        setFolders(data.children.folders)
        setPath(data.path)
      } else {
        // Fetch root folders
        const rootFolders = await fetchAllFolders(null)
        setFolders(rootFolders)
        setPath([{ id: null, name: "My Drive" }])
      }
    } catch (error) {
      toast.error(error.message || "Error loading folders")
      if (folderId) router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }, [folderId, router])

  useEffect(() => {
    if (!authLoading && user) {
      loadFolderData()
    }
  }, [user, authLoading, loadFolderData])

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

  if (authLoading || (loading && folders.length === 0)) {
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
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-black tracking-tight">
            {folderId ? path[path.length - 1]?.name : "My Drive"}
          </h1>
          <Breadcrumbs path={path} onNavigate={handleBreadcrumbClick} />
        </div>

        <NewFolderDialog parentId={folderId} onFolderCreated={loadFolderData} />
      </div>

      <div className="h-px bg-border/40 w-full" />

      <FolderList
        folders={folders}
        onFolderClick={handleFolderClick}
        onRefresh={loadFolderData}
      />
    </div>
  )
}