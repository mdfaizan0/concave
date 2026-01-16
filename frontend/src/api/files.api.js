import apiClient from "./client"

export async function uploadFile({ file, folder_id = null }) {
    const formData = new FormData()
    formData.append("file", file)
    if (folder_id) formData.append("folder_id", folder_id)

    const { data } = await apiClient.post("/files", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    if (!data.success) throw new Error(data.message || "Failed to upload file")
    return data.file
}

export async function fetchFiles(folder_id = null) {
    const { data } = await apiClient.get(`/files${folder_id ? `?folderId=${folder_id}` : ""}`)
    if (!data.success) throw new Error(data.message || "Failed to fetch files")
    return data.files
}

export async function fetchOneFile(file_id) {
    const { data } = await apiClient.get(`/files/${file_id}`)
    if (!data.success) throw new Error(data.message || "Failed to fetch file")
    return data.url // Backend returns { success: true, url: signedUrl }
}

export async function renameFile(id, name, folderId) {
    const payload = {}
    if (name) payload.name = name
    if (folderId !== undefined) payload.folder_id = folderId

    const { data } = await apiClient.patch(`/files/${id}`, payload)
    if (!data.success) throw new Error(data.message || "Failed to update file")
    return data.file
}

export async function trashFile(id) {
    const { data } = await apiClient.delete(`/files/trash/${id}`)
    if (!data.success) throw new Error(data.message || "Failed to trash file")
    return null
}

export async function fetchRecent() {
    const { data } = await apiClient.get("/recent")
    if (!data.success) throw new Error(data.message || "Failed to fetch recent files")
    return data.files
}

export async function fetchTrash() {
    const { data } = await apiClient.get("/folders/trash")
    if (!data.success) throw new Error(data.message || "Failed to fetch trash")
    return data // Returns { files, folders }
}