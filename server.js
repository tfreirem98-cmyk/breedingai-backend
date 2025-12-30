import express from "express";
import cors from "cors";

import { analyzeBreeding } from "./rules/engine.js";

const app = express();

/* ==========================
   CONFIG
========================== */

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

/* ==========================
   HEALTH CHECK
========================== */

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "BreedingAI backend",
    version: "1.0.0"
  });
});

/* ==========================
   ANALYZE ENDPOINT
========================== */

app.post("/analyze", (req, res) => {
  try {
    const {
      breed,
      objective,
      consanguinity,
      antecedentes
    } = req.body;

    // Validación mínima (no rompe frontend)
    if (!breed || !objective || !consanguinity) {
      return res.status(400).json({
        error: "Faltan datos obligatorios"
      });
    }

    const result = analyzeBreeding({
      breed,
      objective,
      consanguinity,
      antecedentes: Array.isArray(antecedentes) ? antecedentes : []
    });

    return res.json(result);
  } catch (error) {
    console.error("❌ Error en análisis:", error.message);

    return res.status(500).json({
      error: "Error interno al generar el análisis"
    });
  }
});

/* ==========================
   START SERVER
========================== */

app.listen(PORT, () => {
  console.log(`✅ BreedingAI backend escuchando en puerto ${PORT}`);
});

