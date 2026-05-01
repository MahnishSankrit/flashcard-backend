import express from "express"
import upload from "../middlewares/uploads.middleware.js"
import { generateFlashcard } from "../controllers/flashcard.controller.js"


const router = express.Router()

// router.post(
//   "/",
//   upload.fields([{ name: "file", maxCount: 1 }]),
//   generateFlashcard
// );

router.post("/", upload.single("file"), generateFlashcard);



export default router
