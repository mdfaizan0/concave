import crypto from "crypto"
import bcrypt from "bcryptjs"
import { supabase } from "../lib/supabase.js";
import { resolveAccess } from "../utils/permissions.js";

export async function createPublicLink(req, res) {
    const { resource_id, resource_type = "file", expires_at, password } = req.body

    try {
        const access = await resolveAccess({
            userId: req.user.id,
            resourceType: resource_type,
            resourceId: resource_id,
            requireEdit: true
        })

        if (!access) {
            return res.status(403).json({ success: false });
        }

        const token = crypto.randomBytes(32).toString("hex")
        const password_hash = password ?
            await bcrypt.hash(password, 10)
            : null

        const { data: link, error } = await supabase
            .from("public_links")
            .insert({
                resource_type,
                resource_id,
                token,
                expires_at: expires_at || null,
                password_hash
            })
            .select("*")
            .single()

        if (error || !link) {
            console.error("Error creating public link:", error)
            return res.status(500).json({ success: false, message: "Error creating public link", code: error.code })
        }

        return res.status(201).json({ success: true, link })
    } catch (error) {
        console.error("Unexpected error creating public link:", error)
        return res.status(500).json({ success: false, message: "Unexpected error creating public link" })
    }
}

export async function accessPublicLink(req, res) {
    const { token } = req.params
    const { password } = req.body

    try {
        const { data: link, error } = await supabase
            .from("public_links")
            .select("*")
            .eq("token", token)
            .single()

        if (error || !link) {
            return res.status(404).json({ success: false, message: "Link not found" })
        }

        if (link.expires_at && new Date(link.expires_at) < new Date()) {
            return res.status(403).json({ success: false, message: "Link has expired" })
        }

        if (link.password_hash) {
            const ok = await bcrypt.compare(password || "", link.password_hash)
            if (!ok) {
                return res.status(403).json({ success: false, message: "Invalid password" })
            }
        }

        let resourceData = {};

        if (link.resource_type === "file") {
            const { data: file } = await supabase
                .from("files")
                .select("storage_path, name")
                .eq("id", link.resource_id)
                .eq("is_deleted", false)
                .single()

            if (!file) {
                return res.status(404).json({ success: false, message: "File not found" })
            }

            const { data: signed, error: signError } = await supabase.storage
                .from("drive")
                .createSignedUrl(file.storage_path, 60, {
                    download: true
                })

            if (signError) {
                console.error("Error creating signed URL:", signError)
                return res.status(500).json({ success: false, message: "Error creating signed URL", code: signError.code })
            }
            resourceData = { type: "file", name: file.name, url: signed.signedUrl };

        } else if (link.resource_type === "folder") {
            const { data: folder } = await supabase
                .from("folders")
                .select("id, name")
                .eq("id", link.resource_id)
                .single()

            if (!folder) {
                return res.status(404).json({ success: false, message: "Folder not found" })
            }

            // Fetch children for viewer
            const { data: files } = await supabase.from("files").select("*").eq("folder_id", folder.id).eq("is_deleted", false);
            const { data: folders } = await supabase.from("folders").select("*").eq("parent_id", folder.id);

            // Generate signed URLs for all files
            let filesWithUrls = [];
            if (files && files.length > 0) {
                const { data: signedUrls, error: signedError } = await supabase.storage
                    .from("drive")
                    .createSignedUrls(files.map(f => f.storage_path), 60 * 60); // 1 hour expiry

                if (!signedError && signedUrls) {
                    filesWithUrls = files.map((f, index) => ({
                        ...f,
                        url: signedUrls[index].signedUrl
                    }));
                } else {
                    console.error("Error signing URLs for folder:", signedError);
                    filesWithUrls = files;
                }
            } else {
                filesWithUrls = [];
            }

            resourceData = { type: "folder", name: folder.name, children: { files: filesWithUrls, folders: folders || [] } };
        }

        return res.status(200).json({ success: true, ...resourceData })
    } catch (error) {
        console.error("Unexpected error accessing public link:", error)
        return res.status(500).json({ success: false, message: "Unexpected error accessing public link" })
    }
}

export async function deletePublicLink(req, res) {
    const { token } = req.params

    try {
        const { error } = await supabase
            .from("public_links")
            .delete()
            .eq("token", token)

        if (error) {
            console.error("Error deleting public link:", error)
            return res.status(500).json({ success: false, message: "Error deleting public link" })
        }

        return res.status(200).json({ success: true })
    } catch (error) {
        console.error("Unexpected error deleting public link:", error)
        return res.status(500).json({ success: false, message: "Unexpected error deleting public link" })
    }
}
