import apiClient from "./client"

export async function starResource(resource_type, resource_id) {
    const { data } = await apiClient.post("/stars", { resource_type, resource_id })
    if (!data.success) throw new Error(data.message || "Failed to star resource")
    return data
}

export async function unstarResource(resource_type, resource_id) {
    const { data } = await apiClient.delete("/stars", { data: { resource_type, resource_id } })
    if (!data.success) throw new Error(data.message || "Failed to unstar resource")
    return data
}

export async function fetchStarred() {
    const { data } = await apiClient.get("/stars")
    if (!data.success) throw new Error(data.message || "Failed to fetch starred items")
    return data.items
}
