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