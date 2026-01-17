import apiClient from "./client"

/**
 * Search for files and folders
 */
export const searchResources = async (query, type, sort = "created_at", order = "desc") => {
    const params = { q: query, sort, order }
    if (type) params.type = type

    const response = await apiClient.get("/search", { params })
    return response.data
}
