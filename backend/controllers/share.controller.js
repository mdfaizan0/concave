import { supabase } from "../lib/supabase.js";
import { resolveAccess } from "../utils/permissions.js";

export async function createShare(req, res) {
    const { resource_type, resource_id, user_id, role } = req.body;

    if (!["viewer", "editor"].includes(role)) {
        return res.status(400).json({ success: false });
    }

    const access = await resolveAccess({
        userId: req.user.id,
        resourceType: resource_type,
        resourceId: resource_id,
        requireEdit: true
    });

    if (!access) {
        return res.status(403).json({ success: false });
    }

    const { data, error } = await supabase
        .from("shares")
        .insert({
            resource_type,
            resource_id,
            user_id,
            role,
            owner_id: req.user.id
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ success: false });
    }

    return res.json({ success: true, share: data });
}

export async function listShares(req, res) {
    const { resourceType, resourceId } = req.params;

    const { data } = await supabase
        .from("shares")
        .select("id, user_id, role, created_at")
        .eq("resource_type", resourceType)
        .eq("resource_id", resourceId);

    return res.json({ success: true, shares: data });
}

export async function revokeShare(req, res) {
  const { id } = req.params;

  await supabase
    .from("shares")
    .delete()
    .eq("id", id);

  return res.json({ success: true });
}