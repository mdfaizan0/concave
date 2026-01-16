import { supabase } from "../lib/supabase.js"

export async function requireAuth(req, res, next) {
    const authHeaders = req.headers.authorization
    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing Authorization header, please login first" })
    }
    try {
        const access_token = authHeaders.split(" ")[1]
        const { data, error } = await supabase.auth.getUser(access_token)

        if (error || !data?.user) {
            return res.status(401).json({ message: "Token Unauthorized/Expired" })
        }

        req.user = data.user
        next()
    } catch (error) {
        console.error("Token verification failed:", error.message)
        return res.status(500).json({ message: "Internal server error." })
    }
}