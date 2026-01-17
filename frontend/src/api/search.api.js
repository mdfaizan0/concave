import apiClient from "./client"

/**
 * Search for files and folders
 * @param {string} query - Search query
 * @param {string} [type] - "file" or "folder" (optional)
 * @param {string} [sort] - Sort field (default: created_at)
 * @param {string} [order] - "asc" or "desc" (default: desc)
 * @returns {Promise<{files: Array, folders: Array}>}
 */
export const searchResources = async (query, type, sort = "created_at", order = "desc") => {
    const params = { q: query, sort, order }
    if (type) params.type = type

    const response = await apiClient.get("/search", { params })
    return response.data
}
