import { supabase } from "./supabase.js"

export const getAllDescendantFolderIds = async (folderId, ownerId) => {
    const { data } = await supabase
        .from("folders")
        .select("id, parent_id")
        .eq("owner_id", ownerId)

    const map = {}
    data.forEach(f => {
        map[f.parent_id] = map[f.parent_id] || []
        map[f.parent_id].push(f.id)
    })

    const result = []
    const stack = [folderId]

    while (stack.length) {
        const current = stack.pop()
        result.push(current)
        if (map[current]) stack.push(...map[current])
    }

    return result
}