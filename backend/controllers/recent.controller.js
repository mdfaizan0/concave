import { supabase } from "../lib/supabase.js"

export async function getRecent(req, res) {
    const userId = req.user.id

    try {
        const { data, error } = await supabase
            .from("files")
            .select("*")
            .eq("is_deleted", false)
            .eq("owner_id", userId)
            .order("updated_at", { ascending: false })
            .limit(10)

        if (error) {
            console.error("Error getting recent files:", error)
            return res.status(500).json({ success: false, message: "Error getting recent files", code: error.code })
        }

        return res.json({ success: true, files: data || [] })
    } catch (error) {
        console.error("Unexpected error getting recent files:", error)
        return res.status(500).json({ success: false, message: "Unexpected error getting recent files" })
    }
}