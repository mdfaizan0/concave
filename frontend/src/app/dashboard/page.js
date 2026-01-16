"use client"

import { fetchFiles, uploadFile } from "@/api/files.api"
import { createFolder, fetchAllFolders } from "@/api/folders.api"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [folders, setFolders] = useState([])
  const [open, setOpen] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [backendUser, setBackendUser] = useState(null)
  const [files, setFiles] = useState([])
  const [currentFolderId, setCurrentFolderId] = useState(null)

  useEffect(() => {
    async function initialize() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/login")
        return
      }
      setUser(data?.session?.user)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`
        }
      })
      const json = await res.json()
      setBackendUser(json)

      const folders = await fetchAllFolders()
      setFolders(folders)

      const fetchedFiles = await fetchFiles()
      setFiles(fetchedFiles)
    }
    initialize()
  }, [router])
  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
        throw error
      }
      router.push("/login")
    } catch (error) {
      console.error(error)
      throw new Error(error);
    }
  }

  async function handleCreateFolder(e, parentId = null) {
    e.preventDefault()
    if (!folderName) return
    const trimmedName = folderName.trim()
    if (trimmedName.length < 3 || trimmedName.length > 60) {
      alert("Folder name should be 3–60 characters long.")
      return
    }
    try {
      const newFolder = await createFolder({ name: trimmedName, parent_id: parentId })
      setFolders(prev => [...prev, newFolder])
    } catch (error) {
      console.error(error)
      throw new Error(error);
    }
  }

  async function handleFileUpload() {
    const file = e.target.files[0]
    if (!file) return;

    try {
      const uploaded = await uploadFile({ file, folder_id: currentFolderId })
      setFiles((prev) => [...prev, uploaded])
    } catch (error) {
      console.error(err)
      alert("File upload failed")
    }
  }

  return (
    <div>
      <button onClick={handleLogout} className="p-2 bg-amber-400 text-black hover:bg-amber-400/30 hover:text-white">Logout</button>
      <div>
        <h1>User: {user?.email}</h1>
        <h1>Backend User: {backendUser?.email}</h1>
        <h1>Folders</h1>
        {folders?.length === 0 ? (
          <div>
            <p>No folders available, Create One?</p>
            <form onSubmit={handleCreateFolder}>
              <input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
              <button type="submit" className="p-2 bg-amber-400 text-black hover:bg-amber-400/30 hover:text-white">Create a folder</button>
            </form>
          </div>
        ) :
          folders?.map(folder => <p key={folder.id}>{folder.name}</p>)}
      </div>
      <h1>Files</h1>
      {files.length === 0 ? (
        <p>No files yet</p>
      ) : (
        files.map(file => (
          <p key={file.id}>📄{file.name} ({Math.round(file.size_bytes / 1024)} KB)</p>
        ))
      )}
      <h2>Upload a file</h2>
      <input type="file" onChange={handleFileUpload} />
    </div>
  )
}

export default DashboardPage