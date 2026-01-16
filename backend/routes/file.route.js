import multer from "multer"
import express from "express"
import { requireAuth } from "../middlewares/auth.middleware.js"
import { getFiles, getOneFile, uploadFile, renameFile, trashFile, restoreFile } from "../controllers/file.controller.js"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.use(requireAuth)

router.post("/", upload.single("file"), uploadFile)
router.get("/", getFiles)
router.get("/:id", getOneFile)
router.patch("/:id", renameFile)
router.delete("/trash/:id", trashFile)
router.patch("/trash/:id", restoreFile)

export default router