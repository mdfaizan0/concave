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
    if (!data.success) throw new Error(data.message || "Failed to fetch files")
    return data.file
}