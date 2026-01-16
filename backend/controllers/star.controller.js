import { supabase } from "../lib/supabase.js";

export async function starResource(req, res) {
    const { resource_type, resource_id } = req.body;

    await supabase
        .from("stars")
        .insert({
            user_id: req.user.id,
            resource_type,
            resource_id
        });

    return res.json({ success: true });
}

export async function unstarResource(req, res) {
    const { resource_type, resource_id } = req.body;

    await supabase
        .from("stars")
        .delete()
        .eq("user_id", req.user.id)
        .eq("resource_type", resource_type)
        .eq("resource_id", resource_id);

    return res.json({ success: true });
}

export async function getStarred(req, res) {
    const userId = req.user.id;

    const { data } = await supabase
        .from("stars")
        .select("*")
        .eq("user_id", userId);

    return res.json({ success: true, items: data });
}