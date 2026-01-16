import express from "express"
import { requireAuth } from "../middlewares/auth.middleware.js"
import { createFolder, getAllFolders, renameFolder, trashFolder, restoreFolder } from "../controllers/folder.controller.js"

const router = express.Router()

router.use(requireAuth)

router.post("/", createFolder)
router.get("/", getAllFolders)
router.patch("/:id", renameFolder)
router.delete("/:id", trashFolder)
router.delete("/:id", restoreFolder)
router.get("/trash", listTrash)

export default router