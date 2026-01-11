import express from "express";
import cors from "cors";
import flashCardsRouter from "../routes/flashCards.route.js"

const app = express();

// middleware
app.use(express.json());
app.use(cors({
 origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

// TEMP DEBUG (remove after success)

// routes
app.use("/api/v1/flashcards", flashCardsRouter)


// test route
app.get("/", (req, res) => {
  res.send("Hello World");
});

export default app;
