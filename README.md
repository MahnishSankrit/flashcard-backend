# Flashcard Backend

Backend service for generating **flashcards from a PDF** using **Google Gemini**.  
Clients upload a PDF, the server extracts text, sends it to Gemini, and returns a JSON array of flashcards (Q/A and optionally MCQs).

Repo: https://github.com/MahnishSankrit/flashcard-backend

---

## Features

- **PDF upload** endpoint (multipart/form-data)
- **PDF text extraction** (server-side)
- **Flashcard generation with Gemini** (`gemini-2.5-flash`)
- Output is **strict JSON** (no markdown, no extra text)
- Supports:
  - `type: "qa"` flashcards (question + answer)
  - `type: "mcq"` flashcards (question + options + correctAnswer)
- **CORS configured** for local dev + custom origin + Vercel preview/prod domains
- Uploaded PDFs are **deleted after extraction** (cleanup)

---

## Tech Stack

- **Node.js** (ESM modules)
- **Express** (v5)
- **multer** (file uploads)
- **pdfjs-dist / pdf-extraction** (PDF parsing pipeline; extraction exposed via `utils/pdfParser.cjs`)
- **@google/generative-ai** (Gemini API client)
- **dotenv** (environment variables)
- **cors**

Language: **JavaScript**

---

## Project Structure

```
.
├─ index.js                     # server entry (loads env, starts app)
├─ src/
│  └─ app.js                    # express app config + routes
├─ routes/
│  └─ flashCards.route.js       # /api/v1/flashcards routes
├─ controllers/
│  └─ flashcard.controller.js   # request handler -> parse PDF -> call Gemini -> respond
├─ middlewares/
│  └─ uploads.middleware.js     # multer setup (PDF-only, size limits, uploads dir)
├─ service/
│  └─ gemini.service.js         # Gemini prompt + JSON parsing + validation
├─ utils/
│  ├─ pdfParser.js              # ESM wrapper that exports extractTextFromPDF
│  └─ pdfParser.cjs             # CJS implementation used by pdfParser.js
└─ uploads/                     # temp storage for uploaded PDFs (runtime)
```

---

## Requirements

- Node.js installed (recommended: **Node 18+**)
- A Google Gemini API key

---

## Setup

### 1) Clone

```bash
git clone https://github.com/MahnishSankrit/flashcard-backend.git
cd flashcard-backend
```

### 2) Install dependencies

```bash
npm install
```

### 3) Create `.env`

Create a `.env` file in the project root:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: allow your frontend origin (in addition to localhost + vercel apps)
CORS_ORIGIN=http://localhost:5173
```

Notes:
- `PORT` defaults to `5000` if not set.
- `CORS_ORIGIN` is optional; requests from `http://localhost:5173` are already allowed by default.

### 4) Run the server

**Development (nodemon):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server starts on:
- `http://localhost:5000` (or your `PORT`)

---

## API

### Health/Test

#### `GET /`
Returns a simple string:
- `Hello World`

---

### Generate Flashcards (PDF → JSON flashcards)

#### `POST /api/v1/flashcards`

Uploads a PDF file and returns generated flashcards.

**Content-Type:** `multipart/form-data`

**Form fields:**
- `file` (**required**) — PDF file
- `maxFlashcards` (optional) — number (default `10`, clamped internally in Gemini service to `1..50`)
- `includeMCQ` (optional) — string
  - `"false"` → generate only Q/A flashcards
  - any other value / omitted → include a mix of MCQ + Q/A

**Success response (200):**
```json
{
  "success": true,
  "flashCards": [
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
}
```

**Error responses:**
- `400` if no PDF uploaded:
```json
{ "success": false, "message": "No PDF file uploaded" }
```

- `500` on server/Gemini/PDF extraction error:
```json
{ "success": false, "message": "something went wrong while generating the flashcard" }
```

---

## Example Requests

### cURL

```bash
curl -X POST "http://localhost:5000/api/v1/flashcards" \
  -F "file=@/path/to/your.pdf" \
  -F "maxFlashcards=15" \
  -F "includeMCQ=true"
```

Generate only Q/A (no MCQ):

```bash
curl -X POST "http://localhost:5000/api/v1/flashcards" \
  -F "file=@/path/to/your.pdf" \
  -F "includeMCQ=false"
```

### Postman / Insomnia

- Method: `POST`
- URL: `http://localhost:5000/api/v1/flashcards`
- Body type: `form-data`
  - Key: `file` (type: File) → choose a PDF
  - Key: `maxFlashcards` (type: Text) → e.g. `10`
  - Key: `includeMCQ` (type: Text) → `true` or `false`

---

## How It Works (Flow)

1. `multer` accepts a **PDF-only** upload (rejects non-PDF mimetypes).
2. File is saved temporarily in `uploads/` with a unique timestamp-based name.
3. Controller calls `extractTextFromPDF(path)` to get raw text.
4. Server deletes the uploaded file (`fs.unlink`) after extraction attempt.
5. Text is sent to Gemini with a strict prompt requiring **valid JSON only**.
6. Response text is parsed with `JSON.parse`.
7. Server returns `{ success: true, flashCards: [...] }`.

---

## Upload Limits & Validation

- **Max file size:** 15 MB
- **Allowed type:** `application/pdf` only
- Gemini output must be valid JSON; otherwise the API returns an error.

---

## CORS Behavior

CORS is enabled with a custom origin function:
- Allows requests with **no Origin** (e.g., server-to-server, Postman)
- Allows:
  - `http://localhost:5173`
  - `process.env.CORS_ORIGIN` (if set)
  - any origin ending with `.vercel.app`

If the origin is not allowed, the server throws: `Not allowed by CORS`.

---

## Scripts

From `package.json`:

- `npm run dev` → start with nodemon
- `npm start` → start with node

---

## Environment Variables

| Variable | Required | Default | Description |
|---------|----------|---------|-------------|
| `PORT` | No | `5000` | Port to run server |
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `CORS_ORIGIN` | No | — | Additional allowed origin |

---

## Deployment Notes

- Ensure `GEMINI_API_KEY` is configured in your hosting provider environment variables.
- If deploying with a frontend, set `CORS_ORIGIN` to your frontend domain (unless it’s on Vercel and ends with `.vercel.app`).
- Make sure the runtime can write to the `uploads/` directory (or modify multer storage to use a tmp directory suited for your platform).

---

## Roadmap / Improvements (Optional)

- Add request validation (e.g., `zod` / `joi`) for `maxFlashcards` and `includeMCQ`
- Add rate limiting + auth (to protect Gemini API usage)
- Add structured error middleware for multer/PDF parsing errors
- Add logging (pino/winston) and request IDs
- Add unit tests for:
  - PDF extraction
  - Gemini response parsing & schema validation

---

## License

No license file is currently present in the repository. If you want this to be open-source, consider adding a `LICENSE` (e.g., MIT).
