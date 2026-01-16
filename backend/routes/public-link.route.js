import express from "express"
import { requireAuth } from "../middlewares/auth.middleware.js"
import { createPublicLink, accessPublicLink } from "../controllers/public-link.controller.js"

const router = express.Router()

router.use(requireAuth)

router.post("/", createPublicLink)
router.get("/:token", accessPublicLink)

export default router