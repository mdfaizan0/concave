import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { requireAuth } from "./middlewares/auth.middleware.js"
import folderRoutes from "./routes/folder.route.js"
import fileRoutes from "./routes/file.route.js"
import publicLinkRoutes from "./routes/public-link.route.js"
import shareRoutes from "./routes/share.route.js"
import starRoutes from "./routes/star.route.js"
import recentRoutes from "./routes/recent.route.js"
import searchRoutes from "./routes/search.route.js"

const app = express()
dotenv.config()

app.use(cors())
app.use(express.json())


app.get("/", (req, res) => {
    res.send("Concaving... 👁️")
})

app.use("/api/folders", folderRoutes)
app.use("/api/files", fileRoutes)
app.use("/api/public-links", publicLinkRoutes)
app.use("/api/shares", shareRoutes)
app.use("/api/stars", starRoutes)
app.use("/api/recent", recentRoutes)
app.use("/api/search", searchRoutes)

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.get("/api/me", requireAuth, (req, res) => {
    res.status(200).json({ id: req.user.id, email: req.user.email })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`))