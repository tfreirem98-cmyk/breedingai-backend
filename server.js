import express from "express";
import cors from "cors";
import { analyze } from "./rules/engine.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  try {
    const { raza, objetivo, consanguinidad, antecedentes } = req.body;

    const result = await analyze({
      breed: raza,
      objective: objetivo,
      consanguinity: consanguinidad,
      antecedentes: antecedentes || []
    });

    // Protección absoluta: SIEMPRE devolver JSON válido
    return res.json({
      verdict: result.verdict || "NO DISPONIBLE",
      score: result.score ?? "-",
      analysisText: result.analysisText || "Análisis no disponible.",
      recommendation:
        result.recommendation ||
        "No se pudo generar una recomendación automática."
    });
  } catch (err) {
    console.error("Error en /analyze:", err);

    // JAMÁS 500
    return res.json({
      verdict: "NO DISPONIBLE",
      score: "-",
      analysisText:
        "No se pudo generar el análisis clínico en este momento.",
      recommendation:
        "Inténtalo de nuevo o consulta con un profesional."
    });
  }
});

// Health check
app.get("/", (_, res) => {
  res.send("BreedingAI backend operativo");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});


