import { supabase } from "../lib/supabase.js"
import { resolveAccess } from "../utils/permissions.js"

export async function uploadFile(req, res) {
    const { folder_id = null } = req.body
    const file = req.file

    if (!file) {
        return res.status(400).json({ success: false, message: "File required" })
    }

    try {
        // 1️⃣ Insert DB metadata
        const { data: dbRow, error: dbError } = await supabase
            .from("files")
            .insert({
                name: file.originalname,
                mime_type: file.mimetype,
                size_bytes: file.size,
                folder_id,
                owner_id: req.user.id
            })
            .select()
            .single()

        if (dbError) {
            console.error("DB error inserting file metadata:", dbError)
            return res.status(500).json({
                success: false,
                message: "DB error inserting file metadata"
            })
        }

        const storagePath = `users/${req.user.id}/files/${dbRow.id}`

        // 2️⃣ Upload to storage
        const { error: storageError } = await supabase.storage
            .from("drive")
            .upload(storagePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            })

        if (storageError) {
            console.error("Storage upload error:", storageError)

            // optional cleanup (good practice)
            await supabase.from("files").delete().eq("id", dbRow.id)

            return res.status(500).json({
                success: false,
                message: "Storage upload failed"
            })
        }

        // 3️⃣ Update storage path
        await supabase
            .from("files")
            .update({ storage_path: storagePath })
            .eq("id", dbRow.id)

        return res.status(201).json({
            success: true,
            file: { ...dbRow, storage_path: storagePath }
        })
    } catch (error) {
        console.error("Unexpected upload error:", error)
        return res.status(500).json({
            success: false,
            message: "Unexpected error while uploading file"
        })
    }
}

export async function getFiles(req, res) {
    const folder_id = req.query.folderId ?? null

    try {
        let query = supabase
            .from("files")
            .select("*")
            .eq("owner_id", req.user.id)
            .eq("is_deleted", false)

        if (folder_id === null) {
            query = query.is("folder_id", null)
        } else {
            query = query.eq("folder_id", folder_id)
        }

        const { data, error } = await query.order("created_at")

        if (error) {
            console.error("Error fetching files:", error)
            return res.status(500).json({
                success: false,
                message: "DB error fetching files"
            })
        }

        return res.status(200).json({
            success: true,
            files: data
        })
    } catch (error) {
        console.error("Unexpected error fetching files:", error)
        return res.status(500).json({
            success: false,
            message: "Unexpected error while fetching files"
        })
    }
}

export async function getOneFile(req, res) {
    const { id } = req.params

    try {
        const { data: file, error } = await supabase
            .from("files")
            .select("storage_path")
            .eq("id", id)
            .eq("owner_id", req.user.id)
            .single()

        if (error || !file) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            })
        }

        const { data: signed, error: signError } = await supabase.storage
            .from("drive")
            .createSignedUrl(file.storage_path, 60)

        if (signError) {
            console.error("Signed URL error:", signError)
            return res.status(500).json({
                success: false,
                message: "Failed to sign download URL"
            })
        }

        return res.status(200).json({
            success: true,
            url: signed.signedUrl
        })
    } catch (error) {
        console.error("Unexpected download error:", error)
        return res.status(500).json({
            success: false,
            message: "Unexpected error while downloading file"
        })
    }
}

export async function renameFile(req, res) {
    const { id } = req.params
    const { name } = req.body
    if (!name || name.trim().length < 3) {
        return res.status(400).json({ success: false, message: "Invalid file name" })
    }
    try {
        const access = await resolveAccess({
            userId: req.user.id,
            resourceType: "file",
            resourceId: id,
            requireEdit: true
        });

        if (!access) {
            return res.status(403).json({ success: false });
        }

        const { data, error } = await supabase
            .from("files")
            .update({ name: name.trim() })
            .eq("owner_id", req.user.id)
            .eq("id", id)
            .eq("is_deleted", false)
            .select()
            .single()

        if (error || data) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            })
        }

        return res.status(200).json({
            success: true,
            file: data
        })
    } catch (error) {
        console.error("Unexpected file rename error:", error)
        return res.status(500).json({
            success: false,
            message: "Unexpected error while renaming file"
        })
    }
}

export async function trashFile(req, res) {
    const { id } = req.params

    try {
        const { error } = await supabase
            .from("files")
            .update({
                is_deleted: true,
                deleted_at: new Date().toISOString()
            })
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
            file: data
        })
    } catch (error) {
        console.error("Unexpected trashing file error:", error)
        return res.status(500).json({
            success: false,
            message: "Unexpected error while trashing file"
        })
    }
}

export async function restoreFile(req, res) {
    const { id } = req.params
    try {
        const access = await resolveAccess({
            userId: req.user.id,
            resourceType: "file",
            resourceId: id,
            requireEdit: true
        });

        if (!access) {
            return res.status(403).json({ success: false });
        }
        
        const { data, error } = await supabase
            .from("files")
            .update({
                is_deleted: false,
                deleted_at: null
            })
            .eq("id", id)
            .eq("owner_id", req.user.id)
            .eq("is_deleted", true)
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
            file: data
        })
    } catch (error) {
        console.error("Unexpected restoring file error:", error)
        return res.status(500).json({
            success: false,
            message: "Unexpected error while restoring file"
        })
    }
}