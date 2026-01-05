import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { analyze } from "./rules/engine.js";

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARES
========================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({ status: "BreedingAI backend OK" });
});

/* =========================
   ANALYZE ENDPOINT
========================= */
app.post("/analyze", async (req, res) => {
  try {
    const { raza, objetivo, consanguinidad, antecedentes } = req.body;

    // Validación estricta pero correcta
    if (
      typeof raza !== "string" ||
      typeof objetivo !== "string" ||
      typeof consanguinidad !== "string" ||
      !Array.isArray(antecedentes)
    ) {
      return res.status(400).json({
        error: "Datos inválidos",
        received: req.body
      });
    }

    const result = await analyze({
      raza,
      objetivo,
      consanguinidad,
      antecedentes
    });

    return res.json(result);

  } catch (err) {
    console.error("ERROR /analyze:", err);
    return res.status(500).json({
      error: "Error interno del servidor"
    });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`BreedingAI backend running on port ${PORT}`);
});
