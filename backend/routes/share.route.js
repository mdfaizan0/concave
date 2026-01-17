import express from "express"
import { createShare, listShares, revokeShare, listSharedWithMe, leaveShare, updateShareRole } from "../controllers/share.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.use(requireAuth)

router.post("/", createShare)
router.get("/me", listSharedWithMe)
router.get("/:resourceType/:resourceId", listShares)
router.delete("/leave/:id", leaveShare)
router.delete("/:id", revokeShare)
router.put("/:id", updateShareRole)

export default router

