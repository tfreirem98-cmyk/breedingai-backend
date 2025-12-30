import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   DATOS BASE POR RAZA
========================= */

const RISK_VALUES = {
  low: 1,
  medium: 3,
  high: 5,
  very_high: 7
};

const BREEDS = {
  "Golden Retriever": {
    risks: {
      hipDysplasia: "high",
      eyeIssues: "medium",
      heartIssues: "medium"
    },
    temperament: "stable",
    geneticDiversity: "medium"
  },
  "Pastor Alemán": {
    risks: {
      hipDysplasia: "high",
      neurological: "medium",
      digestive: "medium"
    },
    temperament: "high_drive",
    geneticDiversity: "low"
  },
  "Bulldog Francés": {
    risks: {
      breathing: "very_high",
      skin: "high",
      spine: "medium"
    },
    temperament: "stable",
    geneticDiversity: "low"
  },
  "Dachshund": {
    risks: {
      spine: "very_high",
      obesity: "medium"
    },
    temperament: "variable",
    geneticDiversity: "medium"
  },
  "Border Collie": {
    risks: {
      neurological: "medium",
      behavioral: "high",
      hipDysplasia: "medium"
    },
    temperament: "high_drive",
    geneticDiversity: "medium_high"
  }
};

/* =========================
   UTILIDADES
========================= */

function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function averageRisk(risks) {
  const values = Object.values(risks).map(
    r => RISK_VALUES[r] ?? 0
  );
  if (values.length === 0) return 2;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/* =========================
   RUTA PRINCIPAL
========================= */

app.post("/analyze", (req, res) => {
  const {
    breed,
    goal,
    consanguinity = "low",
    antecedentes = []
  } = req.body;

  const breedData = BREEDS[breed];

  /* --------- PERFIL GENÉRICO SI NO EXISTE --------- */
  const risks = breedData?.risks || {};
  const temperament = breedData?.temperament || "stable";
  const geneticDiversity = breedData?.geneticDiversity || "medium";

  /* --------- RIESGO BASE --------- */
  let hereditaryRisk = averageRisk(risks);

  /* --------- AJUSTES --------- */
  if (consanguinity === "medium") hereditaryRisk += 1;
  if (consanguinity === "high") hereditaryRisk += 3;

  if (goal === "health") hereditaryRisk *= 1.2;
  if (goal === "morphology") hereditaryRisk *= 0.9;

  antecedentes.forEach(a => {
    if (Object.keys(risks).includes(a)) {
      hereditaryRisk += 2;
    }
  });

  hereditaryRisk = clamp(Math.round(hereditaryRisk));

  /* --------- COMPATIBILIDAD GENÉTICA --------- */
  let geneticCompatibility = 10;

  if (consanguinity === "medium") geneticCompatibility -= 2;
  if (consanguinity === "high") geneticCompatibility -= 4;
  if (geneticDiversity === "low") geneticCompatibility -= 2;

  geneticCompatibility = clamp(geneticCompatibility);

  /* --------- ADECUACIÓN AL OBJETIVO --------- */
  let goalAdequacy = 8;

  if (goal === "work" && temperament !== "high_drive") {
    goalAdequacy -= 2;
  }

  if (goal === "health" && hereditaryRisk > 5) {
    goalAdequacy -= 3;
  }

  goalAdequacy = clamp(goalAdequacy);

  /* --------- DECISIÓN FINAL --------- */
  let classification = "APTO";
  if (hereditaryRisk >= 7) classification = "NO RECOMENDADO";
  else if (hereditaryRisk >= 4) classification = "APTO CON CONDICIONES";

  /* --------- RESPUESTA (COMPATIBLE CON FRONTEND) --------- */
  res.json({
    classification,
    scores: {
      hereditaryRisk,
      geneticCompatibility,
      goalAdequacy
    },
    summary: {
      shortDecision:
        classification === "APTO"
          ? "Cruce viable según los criterios actuales."
          : classification === "APTO CON CONDICIONES"
          ? "Cruce viable con controles y limitaciones."
          : "Cruce no recomendado según el nivel de riesgo detectado."
    },
    recommendations: {
      breedingAdvice: [
        hereditaryRisk >= 5
          ? "Aplicar controles genéticos y limitar la repetición del cruce."
          : "Mantener buenas prácticas de selección y seguimiento veterinario."
      ]
    },
    finalDecision: {
      warning:
        hereditaryRisk >= 7
          ? "Riesgo elevado de problemas hereditarios si se realiza este cruce."
          : hereditaryRisk >= 4
          ? "Se recomienda precaución y evaluación veterinaria previa."
          : ""
    }
  });
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ BreedingAI backend activo en puerto ${PORT}`);
});
