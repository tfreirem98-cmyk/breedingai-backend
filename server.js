import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runAnalysis } from "./rules/engine.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("BreedingAI backend running");
});

// Analyze endpoint
app.post("/analyze", async (req, res) => {
  try {
    const { raza, objetivo, consanguinidad, antecedentes } = req.body;

    if (!raza || !objetivo || !consanguinidad || !antecedentes) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Convertir antecedentes objeto → array
    const antecedentesArray = Object.entries(antecedentes)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    const result = await runAnalysis({
      raza,
      objetivo,
      consanguinidad,
      antecedentes: antecedentesArray
    });

    res.json(result);
  } catch (error) {
    console.error("Error en /analyze:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Server start
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`BreedingAI backend listening on port ${PORT}`);
});
