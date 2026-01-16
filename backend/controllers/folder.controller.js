import { getAllDescendantFolderIds } from "../lib/getAllDescendantFolderIds.js";
import { supabase } from "../lib/supabase.js"
import { resolveAccess } from "../utils/permissions.js";



export async function getFolderById(req, res) {
    const { id } = req.params;
    try {
        // 1. Get folder details
        const { data: folder, error: folderError } = await supabase
            .from("folders")
            .select("*")
            .eq("id", id)
            .eq("is_deleted", false)
            .single();

        if (folderError || !folder) {
            return res.status(404).json({ success: false, message: "Folder not found" });
        }

        // 2. Access check
        const access = await resolveAccess({
            userId: req.user.id,
            resourceType: "folder",
            resourceId: id
        });

        if (!access) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        // 3. Get children folders
        const { data: folders, error: childrenError } = await supabase
            .from("folders")
            .select("*")
            .eq("parent_id", id)
            .eq("is_deleted", false)
            .order("name", { ascending: true });

        if (childrenError) {
            console.error("Error getting children folders:", childrenError);
        }

        // 4. Construct path (breadcrumbs)
        const path = [];
        let currentParentId = folder.parent_id;
        path.push({ id: folder.id, name: folder.name });

        while (currentParentId) {
            const { data: parent } = await supabase
                .from("folders")
                .select("id, name, parent_id")
                .eq("id", currentParentId)
                .single();

            if (parent) {
                path.unshift({ id: parent.id, name: parent.name });
                currentParentId = parent.parent_id;
            } else {
                currentParentId = null;
            }
        }

        // Add root to path
        path.unshift({ id: null, name: "My Drive" });

        return res.status(200).json({
            success: true,
            folder,
            children: {
                folders: folders || []
            },
            path
        });
    } catch (error) {
        console.error("Error fetching folder details:", error.message);
        return res.status(500).json({ success: false, message: "Error fetching folder details" });
    }
}

export async function createFolder(req, res) {
    const { name, parent_id = null } = req.body
    if (!name) return res.status(400).json({ message: "Folder name required" })

    if (name.trim().length < 3 || name.trim().length > 60) {
        return res.status(400).json({ message: "Invalid folder name length" });
    }
    try {
        const { data, error } = await supabase
            .from("folders")
            .insert({
                name,
                parent_id,
                owner_id: req.user.id
            })
            .select()
            .single()

        if (error) {
            console.error("Error creating folder:", error)
            return res.status(500).json({ message: "DB error: creating a folder.", code: error.code })
        }

        return res.status(201).json({ success: true, folder: data })
    } catch (error) {
        console.error("Error creating folder:", error.message)
        return res.status(500).json({ message: "Error creating folder" })
    }
}


export async function getAllFolders(req, res) {
    const parent_id = req.query.parentId ?? null
    try {
        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq("owner_id", req.user.id)
            .eq("is_deleted", false)
            .is("parent_id", parent_id)
            .order("created_at", { ascending: true })

        if (error) {
            console.error("Error getting all folders:", error)
            return res.status(500).json({ message: "DB error: getting all folders.", code: error.code })
        }

        return res.status(200).json({ success: true, folders: data || [] })
    } catch (error) {
        console.error("Error getting all folders:", error.message)
        return res.status(500).json({ message: "Error getting all folders" })
    }
}

export async function renameFolder(req, res) {
    const { id } = req.params
    const { name } = req.body
    if (!name || name.trim().length < 3) {
        return res.status(400).json({ success: false, message: "Invalid folder name" })
    }
    try {
        const access = await resolveAccess({
            userId: req.user.id,
            resourceType: "folder",
            resourceId: id,
            requireEdit: true
        });

        if (!access) {
            return res.status(403).json({ success: false });
        }

        const { data, error } = await supabase
            .from("folders")
            .update({ name: name.trim() })
            .eq("owner_id", req.user.id)
            .eq("id", id)
            .eq("is_deleted", false)
            .select()
            .single()

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            })
        }

        return res.status(200).json({
            success: true,
            folder: data
        })
    } catch (error) {
        console.error("Unexpected folder rename error:", error)
        return res.status(500).json({
            success: false,
            message: "Unexpected error while renaming folder"
        })
    }
}

export async function trashFolder(req, res) {
    const { id } = req.params

    try {
        const access = await resolveAccess({
            userId: req.user.id,
            resourceType: "folder",
            resourceId: id,
            requireEdit: true
        });

        if (!access) {
            return res.status(403).json({ success: false });
        }

        const folderIds = await getAllDescendantFolderIds(id, req.user.id)

        await supabase
            .from("folders")
            .update({
                is_deleted: true,
                deleted_at: new Date().toISOString()
            })
            .in("id", folderIds)
            .eq("owner_id", req.user.id)

        await supabase
            .from("files")
            .update({
                is_deleted: true,
                deleted_at: new Date().toISOString()
            })
            .in("folder_id", folderIds)
            .eq("owner_id", req.user.id)

        return res.status(200).json({
            success: true,
            folder: null
        })
    } catch (error) {
        console.error("Unexpected trashing folder error:", error)
        return res.status(500).json({
            success: false,
            message: "Unexpected error while trashing folder"
        })
    }
}

export async function restoreFolder(req, res) {
    const { id } = req.params
    try {
        const folderIds = await getAllDescendantFolderIds(id, req.user.id)

        await supabase
            .from("folders")
            .update({
                is_deleted: false,
                deleted_at: null
            })
            .in("id", folderIds)
            .eq("owner_id", req.user.id)

        await supabase
            .from("files")
            .update({
                is_deleted: false,
                deleted_at: null
            })
            .in("folder_id", folderIds)
            .eq("owner_id", req.user.id)

        return res.status(200).json({
            success: true,
            folder: null
        })
    } catch (error) {
        console.error("Unexpected restoring folder error:", error)
        return res.status(500).json({
            success: false,
            message: "Unexpected error while restoring folder"
        })
    }
}

export async function listTrash(req, res) {
    try {
        const { data: folders, error: foldersError } = await supabase
            .from("folders")
            .select("*")
            .eq("owner_id", req.user.id)
            .eq("is_deleted", true)

        if (foldersError || !folders) {
            return res.status(404).json({
                success: false,
                message: "Folder not found"
            })
        }

        const { data: files, error: filesError } = await supabase
            .from("files")
            .select("*")
            .eq("owner_id", req.user.id)
            .eq("is_deleted", true)

        if (filesError || !files) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            })
        }

        return res.status(200).json({
            success: true,
            files,
            folders
        })
    } catch (error) {
        console.error("Unexpected listing trash error:", error)
        return res.status(500).json({
            success: false,
            message: "Unexpected error while listing trash"
        })
    }
}