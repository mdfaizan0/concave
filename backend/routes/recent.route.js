import express from "express"
import { getRecent } from "../controllers/recent.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.use(requireAuth)

router.get("/", getRecent)

export default router