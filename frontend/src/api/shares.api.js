import apiClient from "./client"

export async function createShare({ resource_type, resource_id, user_id, role }) {
    const { data } = await apiClient.post("/shares", { resource_type, resource_id, user_id, role })
    if (!data.success) throw new Error(data.message || "Failed to share resource")
    return data.share
}

export async function listShares(resource_type, resource_id) {
    const { data } = await apiClient.get(`/shares/${resource_type}/${resource_id}`)
    if (!data.success) throw new Error(data.message || "Failed to list shares")
    return data.shares
}

export async function revokeShare(id) {
    const { data } = await apiClient.delete(`/shares/${id}`)
    if (!data.success) throw new Error(data.message || "Failed to revoke share")
    return data
}
