import express from "express";
import cors from "cors";
import flashCardsRouter from "../routes/flashCards.route.js"

const app = express();

// middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server & Postman
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      process.env.CORS_ORIGIN,
    ];

    // allow Vercel preview + prod domains
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
}));


// TEMP DEBUG (remove after success)

// routes
app.use("/api/v1/flashcards", flashCardsRouter)


// test route
app.get("/", (req, res) => {
  res.send("Hello World");
});

export default app;
