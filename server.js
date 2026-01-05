import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runAnalysis } from "./rules/engine.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  try {
    const { raza, objetivo, consanguinidad, antecedentes } = req.body;

    if (!raza || !objetivo || !consanguinidad) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const result = await runAnalysis({
      raza,
      objetivo,
      consanguinidad,
      antecedentes: antecedentes || []
    });

    res.json(result);
  } catch (err) {
    console.error("Error en análisis:", err);
    res.status(500).json({ error: "Error interno de análisis" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BreedingAI backend running on port ${PORT}`);
});

