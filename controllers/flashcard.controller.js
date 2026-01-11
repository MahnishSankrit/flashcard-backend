import { extractTextFromPDF } from "../utils/pdfParser.js";
import { generateFlashcardsWithGemini } from "../service/gemini.service.js";
import fs from "fs";

export const generateFlashcard = async (req, res) => {
  try {
    // 1. get file from multer fields()
    const file = req.files?.file?.[0];

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded",
      });
    }

    // 2. destructure FROM file (not req.file)
    const { originalname, filename, path, size } = file;

    // 3. extract text
    const text = await extractTextFromPDF(path);
    console.log(text.slice(0, 200));

    // 4. cleanup PDF
    fs.unlink(path, (err) => {
      if (err) {
        console.error("failed to delete the uploaded pdf", err);
      } else {
        console.log("uploaded pdf deleted successfully");
      }
    });

    // 5. Gemini options
    const maxFlashcards = Number(req.body.maxFlashcards) || 10;
    const includeMCQ = req.body.includeMCQ !== "false";

    // 6. call Gemini
    const flashCards = await generateFlashcardsWithGemini({
      text,
      maxFlashcards,
      includeMCQ,
    });

    // 7. response
    return res.status(200).json({
      success: true,
      flashCards,
    });

  } catch (error) {
    console.error("flashCard generation error", error);
    return res.status(500).json({
      success: false,
      message: "something went wrong while generating the flashcard",
    });
  }
};
