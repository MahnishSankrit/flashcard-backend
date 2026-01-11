// import fs from "fs";
// import { createRequire } from "module";

// const require = createRequire(import.meta.url);

// ✅ Node-safe legacy build (NO DOMMatrix)
// const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

// export const extractTextFromPDF = async (filePath) => {
//   try {
//     const data = new Uint8Array(fs.readFileSync(filePath));

//     const loadingTask = pdfjsLib.getDocument({ data });
//     const pdf = await loadingTask.promise;

//     let extractedText = "";

//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const content = await page.getTextContent();

//       const pageText = content.items
//         .map(item => item.str)
//         .join(" ");

//       extractedText += pageText + "\n";
//     }

//     return extractedText;
//   } catch (error) {
//     console.error("PDF parsing error:", error);
//     throw new Error("Failed to extract text from PDF");
//   }
// };



// pure ESM
 import { createRequire } from "module";
const require = createRequire(import.meta.url);

export const { extractTextFromPDF } = require("./pdfParser.cjs");

