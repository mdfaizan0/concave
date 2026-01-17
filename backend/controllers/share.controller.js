import { supabase } from "../lib/supabase.js";
import { resolveAccess } from "../utils/permissions.js";

export async function createShare(req, res) {
    const { resource_type, resource_id, email, role } = req.body;

    if (!["viewer", "editor"].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role" });
    }

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const access = await resolveAccess({
        userId: req.user.id,
        resourceType: resource_type,
        resourceId: resource_id,
        requireEdit: true
    });

    if (!access) {
        return res.status(403).json({ success: false, message: "You don't have permission to share this resource" });
    }

    // Resolve email to user_id using the admin client (supabase variable is already admin client)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error("Error listing users:", userError);
        return res.status(500).json({ success: false, message: "Error resolving user" });
    }

    // Find user by email (case-insensitive)
    const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!targetUser) {
        return res.status(404).json({ success: false, message: "User not found. They must be registered with Concave." });
    }

    if (targetUser.id === req.user.id) {
        return res.status(400).json({ success: false, message: "You cannot share with yourself" });
    }

    // Check if already shared
    const { data: existingShare } = await supabase
        .from("shares")
        .select("id")
        .eq("resource_type", resource_type)
        .eq("resource_id", resource_id)
        .eq("user_id", targetUser.id)
        .single();

    if (existingShare) {
        return res.status(400).json({ success: false, message: "User already has access" });
    }

    const { data, error } = await supabase
        .from("shares")
        .insert({
            resource_type,
            resource_id,
            user_id: targetUser.id,
            role,
            owner_id: req.user.id
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    // Return the share data, but enrich it with the email for the frontend
    return res.json({ success: true, share: { ...data, user_email: targetUser.email } });
}

export async function listShares(req, res) {
    const { resourceType, resourceId } = req.params;

    const { data: shares, error } = await supabase
        .from("shares")
        .select("id, user_id, role, created_at")
        .eq("resource_type", resourceType)
        .eq("resource_id", resourceId);

    if (error) {
        return res.status(500).json({ success: false, message: "Error listing shares" });
    }

    if (!shares || shares.length === 0) {
        return res.json({ success: true, shares: [] });
    }

    // Optimization: In a real app, we'd have a public profile table.
    // Here we must fetch users to get emails.
    const { data: { users } } = await supabase.auth.admin.listUsers();

    const enrichedShares = shares.map(share => {
        const user = users.find(u => u.id === share.user_id);
        return {
            ...share,
            user_email: user?.email || "Unknown User"
        };
    });

    return res.json({ success: true, shares: enrichedShares });
}

export async function revokeShare(req, res) {
    const { id } = req.params;

    await supabase
        .from("shares")
        .delete()
        .eq("id", id);

    return res.json({ success: true });
}

export async function updateShareRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    if (!["viewer", "editor"].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // 1. Get the share to find the resource
    const { data: share, error: shareError } = await supabase
        .from("shares")
        .select("resource_type, resource_id, owner_id")
        .eq("id", id)
        .single();

    if (shareError || !share) {
        return res.status(404).json({ success: false, message: "Share not found" });
    }

    // 2. Security: Only the owner of the resource can update roles
    // The 'owner_id' on the share record is the person who created the share, 
    // which in our current logic IS the owner of the resource.
    if (share.owner_id !== userId) {
        return res.status(403).json({ success: false, message: "Only the owner can update roles" });
    }

    // 3. Update the role
    const { error: updateError } = await supabase
        .from("shares")
        .update({ role })
        .eq("id", id);

    if (updateError) {
        return res.status(500).json({ success: false, message: "Failed to update role" });
    }

    return res.json({ success: true });
}

export async function listSharedWithMe(req, res) {
    const userId = req.user.id;

    const { data: shares, error } = await supabase
        .from("shares")
        .select("id, resource_type, resource_id, role, owner_id, created_at")
        .eq("user_id", userId);

    if (error) {
        return res.status(500).json({ success: false, message: "Error listing shared items" });
    }

    if (!shares || shares.length === 0) {
        return res.json({ success: true, files: [], folders: [] });
    }

    // Optimization: In a real app, we'd have a public profile table.
    // Here we must fetch users to get emails.
    const { data: { users } } = await supabase.auth.admin.listUsers();

    const sharedFiles = [];
    const sharedFolders = [];

    // Group by type to batch fetch if possible, but for MVP loop is safer to handle missing items
    for (const share of shares) {
        const owner = users.find(u => u.id === share.owner_id);
        const ownerEmail = owner?.email || "Unknown User";

        if (share.resource_type === "file") {
            const { data: file } = await supabase
                .from("files")
                .select("*")
                .eq("id", share.resource_id)
                .eq("is_deleted", false) // Don't show deleted files
                .single();

            if (file) {
                sharedFiles.push({
                    ...file,
                    role: share.role,
                    share_id: share.id,
                    owner_email: ownerEmail
                });
            }
        } else if (share.resource_type === "folder") {
            const { data: folder } = await supabase
                .from("folders")
                .select("*")
                .eq("id", share.resource_id)
                .eq("is_deleted", false)
                .single();

            if (folder) {
                sharedFolders.push({
                    ...folder,
                    role: share.role,
                    share_id: share.id,
                    owner_email: ownerEmail
                });
            }
        }
    }

    return res.json({ success: true, files: sharedFiles, folders: sharedFolders });
}

export async function leaveShare(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    // Only allow deleting raw share record if it belongs to the requesting user
    const { error } = await supabase
        .from("shares")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    if (error) {
        return res.status(500).json({ success: false, message: "Error leaving share" });
    }

    return res.json({ success: true });
}