import apiClient from "./client";

export async function fetchAllFolders(parentId = null) {
    const { data } = await apiClient.get(`/folders${parentId ? `?parentId=${parentId}` : ""}`)
    if (!data.success) throw new Error(data.message || "Failed to fetch folders");
    return data.folders
}

export async function createFolder(folderData) {
    const { data } = await apiClient.post(`/folders`, folderData)
    if (!data.success) throw new Error(data.message || "Failed to create folder");
    return null
}

export async function fetchFolderById(id) {
    const { data } = await apiClient.get(`/folders/${id}`)
    if (!data.success) throw new Error(data.message || "Failed to fetch folder details");
    return data
}

export async function renameFolder(id, name, parentId) {
    const payload = {}
    if (name) payload.name = name
    if (parentId !== undefined) payload.parent_id = parentId

    const { data } = await apiClient.patch(`/folders/${id}`, payload)
    if (!data.success) throw new Error(data.message || "Failed to update folder");
    return data.folder
}

export async function trashFolder(id) {
    const { data } = await apiClient.delete(`/folders/${id}`)
    if (!data.success) throw new Error(data.message || "Failed to trash folder");
    return null
}