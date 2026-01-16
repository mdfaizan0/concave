import apiClient from "./client";

export async function fetchAllFolders(parentId = null) {
    const { data } = await apiClient.get(`/folders${parentId ? `?parentId=${parentId}` : ""}`)
    if (!data.success) throw new Error(res.data.message || "Failed to fetch folders");
    return data.folders
}

export async function createFolder(folderData) {
    const { data } = await apiClient.post(`/folders`, folderData)
    if (!data.success) throw new Error(res.data.message || "Failed to create folder");
    return null
}