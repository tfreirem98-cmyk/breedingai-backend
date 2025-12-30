import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json());

/* =======================
   BASE DE CONOCIMIENTO
======================= */

const BREED_PROFILES = {
  "Golden Retriever": {
    baseRisk: 4,
    commonIssues: ["displasia", "oculares"],
    temperament: "equilibrado",
    suitableObjectives: ["salud", "familia"]
  },
  "Bulldog Francés": {
    baseRisk: 7,
    commonIssues: ["respiratorios", "neurologicos"],
    temperament: "braquicefálico",
    suitableObjectives: ["salud"]
  },
  "Border Collie": {
    baseRisk: 5,
    commonIssues: ["neurologicos", "oculares"],
    temperament: "alta energía",
    suitableObjectives: ["rendimiento", "trabajo"]
  }
};

const CONSANGUINITY_PENALTY = {
  baja: 0,
  media: 2,
  alta: 4
};

/* =======================
   MOTOR DE ANÁLISIS
======================= */

function analyzeCross(data) {
  const {
    raza,
    objetivo,
    consanguinidad,
    antecedentes = []
  } = data;

  if (!BREED_PROFILES[raza]) {
    return {
      error: "Raza no soportada por el sistema profesional."
    };
  }

  const breed = BREED_PROFILES[raza];

  // Riesgo hereditario
  let hereditaryRisk = breed.baseRisk;
  antecedentes.forEach(a => {
    if (breed.commonIssues.includes(a)) {
      hereditaryRisk += 1.5;
    } else {
      hereditaryRisk += 0.5;
    }
  });
  hereditaryRisk += CONSANGUINITY_PENALTY[consanguinidad] || 0;
  hereditaryRisk = Math.min(10, Math.round(hereditaryRisk));

  // Compatibilidad genética
  let compatibility = 10 - hereditaryRisk;
  compatibility = Math.max(1, compatibility);

  // Adecuación al objetivo
  let suitability = breed.suitableObjectives.includes(objetivo) ? 9 : 5;

  // Clasificación final
  let classification = "APTO";
  if (hereditaryRisk >= 7) classification = "APTO CON CONDICIONES";
  if (hereditaryRisk >= 9) classification = "NO RECOMENDADO";

  return {
    classification,
    scores: {
      riesgoHereditario: hereditaryRisk,
      compatibilidadGenetica: compatibility,
      adecuacionObjetivo: suitability
    },
    professionalAssessment: {
      summary: `Evaluación profesional del cruce para ${raza}.`,
      recommendation:
        classification === "APTO"
          ? "Cruce recomendable bajo prácticas de cría responsable."
          : classification === "APTO CON CONDICIONES"
          ? "Cruce viable solo con control genético y sanitario estricto."
          : "Cruce no recomendable por alto riesgo hereditario.",
      warnings:
        hereditaryRisk >= 7
          ? "Se recomienda seguimiento veterinario especializado."
          : "Riesgo controlado bajo condiciones normales."
    }
  };
}

/* =======================
   ENDPOINT PRINCIPAL
======================= */

app.post("/analyze", (req, res) => {
  try {
    const result = analyzeCross(req.body);

    if (result.error) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error interno al generar el análisis profesional."
    });
  }
});

/* =======================
   SERVER
======================= */

app.listen(PORT, () => {
  console.log(`✅ BreedingAI backend activo en puerto ${PORT}`);
});

