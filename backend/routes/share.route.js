import express from "express"
import { createShare, listShares, revokeShare } from "../controllers/share.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.use(requireAuth)

router.post("/", createShare)
router.get("/:resourceType/:resourceId", listShares)
router.delete("/:id", revokeShare)

export default router

