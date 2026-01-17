import apiClient from "./client";

/**
 * Creates a public link for a resource.
 * Currently only supports "file" as per backend controller.
 */
export async function createPublicLink({ resource_id, expires_at, password }) {
    const { data } = await apiClient.post("/public-links", { resource_id, expires_at, password });
    if (!data.success) throw new Error(data.message || "Failed to create public link");
    return data.link;
}

/**
 * Validates/Accesses a public link.
 */
export async function accessPublicLink(token, password = null) {
    const { data } = await apiClient.post(`/public-links/${token}/access`, { password });
    if (!data.success) throw new Error(data.message || "Link invalid or expired");
    return data;
}

/**
 * Revoke a public link.
 */
export async function revokePublicLink(token) {
    const { data } = await apiClient.delete(`/public-links/${token}`);
    if (!data.success) throw new Error(data.message || "Failed to revoke public link");
    return null;
}