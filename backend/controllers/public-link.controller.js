import crypto from "crypto"
import bcrypt from "bcryptjs"
import { supabase } from "../lib/supabase.js";

export async function createPublicLink(req, res) {
    const { resource_id, expires_at, password } = req.body

    try {
        const access = await resolveAccess({
            userId: req.user.id,
            resourceType: "file",
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
                resource_type: "file",
                resource_id,
                token,
                expires_at: expires_at || null,
                password_hash
            })
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

        const { data: file } = await supabase
            .from("files")
            .select("storage_path, name")
            .eq("id", link.resource_id)
            .eq("is_deleted", false)
            .single()

        if (!file) {
            return res.status(404).json({success: false, message: "File not found"})
        }

        const {data: signed, error:signError} = await supabase.storage
            .from("drive")
            .createSignedUrl(file.storage_path, 60)

        if (signError) {
            console.error("Error creating signed URL:", signError)
            return res.status(500).json({success: false, message: "Error creating signed URL", code: signError.code})
        }

        return res.status(200).json({success: true, url: signed.signedUrl, name: file.name})
    } catch (error) {
        console.error("Unexpected error accessing public link:", error)
        return res.status(500).json({success: false, message: "Unexpected error accessing public link"})
    }
}