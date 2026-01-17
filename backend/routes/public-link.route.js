import express from "express"
import { requireAuth } from "../middlewares/auth.middleware.js"
import { createPublicLink, accessPublicLink, deletePublicLink } from "../controllers/public-link.controller.js"

const router = express.Router()

router.post("/:token/access", accessPublicLink)

router.use(requireAuth)

router.post("/", createPublicLink)
router.delete("/:token", deletePublicLink)

export default router