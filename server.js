import express from "express";
import cors from "cors";
import { analyzeBreeding } from "./rules/engine.js";

const app = express();

/* CORS – PERMITIR TU FRONTEND */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.json({ status: "BreedingAI backend online" });
});

/* ANALYZE */
app.post("/analyze", (req, res) => {
  try {
    const { breed, goal, inbreeding, conditions } = req.body;

    if (!breed || !goal || !inbreeding) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const result = analyzeBreeding({
      breed,
      goal,
      inbreeding,
      conditions: conditions || []
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno de análisis" });
  }
});

/* PUERTO RENDER */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("BreedingAI backend running on port", PORT);
});

