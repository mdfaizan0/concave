/**
 * Permission Helper Layer
 * 
 * Provides pure, side-effect free logic for UI gating.
 * This layer is designed to be the foundation for Phase 7 (Sharing).
 * 
 * Logic Mapping:
 * - Owner: Full access (Rename, Move, Delete, Share, Star, Create)
 * - Editor: Collaboration access (Rename, Move, Star, Create) but NO Sharing or Deletion
 * - Viewer: Read-only (Star, Download)
 * 
 * Fallback: If no role is present, it compares resource.owner_id with userId.
 */

/**
 * Checks if the user can rename the resource.
 */
export const canRename = (resource, userId) => {
    if (!resource) return false
    const role = resource.role || (resource.owner_id === userId ? "owner" : null)
    return role === "owner" || role === "editor"
}

/**
 * Checks if the user can move the resource.
 */
export const canMove = (resource, userId) => {
    if (!resource) return false
    const role = resource.role || (resource.owner_id === userId ? "owner" : null)
    return role === "owner" || role === "editor"
}

/**
 * Checks if the user can trash/delete the resource.
 */
export const canDelete = (resource, userId) => {
    if (!resource) return false
    const role = resource.role || (resource.owner_id === userId ? "owner" : null)
    // Deletion is strictly reserved for the owner
    return role === "owner"
}

/**
 * Checks if the user can share the resource.
 */
export const canShare = (resource, userId) => {
    if (!resource) return false
    const role = resource.role || (resource.owner_id === userId ? "owner" : null)
    // Sharing permissions are strictly reserved for the owner (Phase 7 ready)
    return role === "owner"
}

/**
 * Checks if the user can star the resource.
 */
export const canStar = (resource, userId) => {
    // Stars are personal metadata; if you can see it, you can star it.
    return !!userId
}

/**
 * Checks if the user can download the file.
 */
export const canDownload = (resource, userId) => {
    if (!resource) return false
    // Public links support (Phase 7 ready)
    if (resource.is_public) return true
    // If not public, must be logged in
    return !!userId
}

/**
 * Checks if the user can create items (folders/uploads) within a parent resource.
 */
export const canCreate = (parentResource, userId) => {
    // Root level: If logged in, you can create
    if (!parentResource) return !!userId

    const role = parentResource.role || (parentResource.owner_id === userId ? "owner" : null)
    return role === "owner" || role === "editor"
}
