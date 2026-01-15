import express from "express";
import cors from "cors";
import flashCardsRouter from "../routes/flashCards.route.js"

const app = express();

// middleware
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CORS_ORIGIN
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: false,
}));

// TEMP DEBUG (remove after success)

// routes
app.use("/api/v1/flashcards", flashCardsRouter)


// test route
app.get("/", (req, res) => {
  res.send("Hello World");
});

export default app;
