import { supabase } from "../lib/supabase.js"

export async function search(req, res) {
    const { q = "", type, sort = "created_at", order = "desc" } = req.query
    const userId = req.user.id
    console.log("q", q)

    try {
        let files = []
        let folders = []

        if (!type || type === "file") {
            const { data, error } = await supabase
                .from("files")
                .select("*")
                .eq("is_deleted", false)
                .eq("owner_id", userId)
                .ilike("name", `%${q}%`)
                .order(sort, { ascending: order === "asc" })

            if (error) {
                console.error("Error searching files:", error)
                return res.status(500).json({ success: false, message: "Error searching files", code: error.code })
            }

            files = data || []
        }

        if (!type || type === "folder") {
            const { data, error } = await supabase
                .from("folders")
                .select("*")
                .eq("is_deleted", false)
                .eq("owner_id", userId)
                .ilike("name", `%${q}%`)
                .order(sort, { ascending: order === "asc" })

            if (error) {
                console.error("Error searching folders:", error)
                return res.status(500).json({ success: false, message: "Error searching folders", code: error.code })
            }

            folders = data || []
        }

        return res.json({
            success: true,
            files,
            folders
        })
    } catch (error) {
        console.error("Unexpected error searching:", error)
        return res.status(500).json({ success: false, message: "Unexpected error searching" })
    }
}