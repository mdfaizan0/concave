import express from "express"
import { search } from "../controllers/search.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.use(requireAuth)

router.get("/", search)

export default router