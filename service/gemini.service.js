import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: clamp values safely
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const generateFlashcardsWithGemini = async ({
    text,
    maxFlashcards = 10,
    includeMCQ = true,
}) => {
    if (!text || typeof text !== "string") {
        throw new Error("Invalid text input for Gemini");
    }

    // Safety limits
    const TOTAL = clamp(Number(maxFlashcards) || 10, 1, 50);

    // You can later evolve this to a ratio (e.g., 40% MCQ)
    const MCQ_RULE = includeMCQ
        ? "Include a reasonable mix of MCQ and normal questions."
        : "Generate only normal question-answer flashcards (no MCQs).";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a learning assistant.

TASK:
From the provided study text, generate up to ${TOTAL} flashcards for learning.

RULES:
- ${MCQ_RULE}
- Each flashcard MUST be either:
  1) type: "qa"
  2) type: "mcq"
- Keep questions clear and concise.
- Answers should be short and factual.
- Do NOT repeat questions.
- Do NOT include markdown.
- Do NOT include explanations outside JSON.

FORMAT (STRICT — FOLLOW EXACTLY):
Return ONLY valid JSON in this array format:

[
  {
    "type": "qa",
    "question": "string",
    "answer": "string"
  },
  {
    "type": "mcq",
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "one of the options"
  }
]

IMPORTANT:
- The response must be valid JSON.
- No trailing commas.
- No extra text before or after JSON.

STUDY TEXT:
"""${text}"""
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // Parse safely
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        console.error("Gemini raw output:", raw);
        throw new Error("Gemini did not return valid JSON");
    }

    // Final sanity check
    if (!Array.isArray(parsed)) {
        throw new Error("Gemini response is not an array");
    }

    return parsed.slice(0, TOTAL);
};
