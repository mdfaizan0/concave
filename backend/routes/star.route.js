import express from "express"
import { getStarred, starResource, unstarResource } from "../controllers/star.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.use(requireAuth)

router.get("/", getStarred)
router.post("/", starResource)
router.delete("/", unstarResource)

export default router