import express from "express";
import cors from "cors";

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json());

/* =======================
   RUTA DE SALUD
======================= */
app.get("/", (req, res) => {
  res.send("BreedingAI backend activo");
});

/* =======================
   RUTA PRINCIPAL
======================= */
app.post("/analyze", async (req, res) => {
  try {
    const { animal, breed, origin, goal } = req.body;

    // Validación mínima
    if (!animal || !breed || !goal) {
      return res.status(400).json({
        error: "Datos insuficientes para el análisis"
      });
    }

    /* =======================
       LÓGICA PROFESIONAL
       (simulada ahora, IA después)
    ======================= */

    // Clasificación base
    let classification = "APTO CON CONDICIONES";
    let hereditaryRiskScore = 4;

    if (goal.toLowerCase().includes("exposición")) {
      hereditaryRiskScore = 5;
    }

    if (goal.toLowerCase().includes("salud")) {
      hereditaryRiskScore = 3;
    }

    const response = {
      classification,

      summary: {
        shortDecision:
          "Cruce viable con control genético y sanitario",
        confidenceLevel: "Media-Alta"
      },

      scores: {
        geneticCompatibility: 8,
        hereditaryRisk: hereditaryRiskScore,
        goalAdequacy: 9
      },

      breedContext: {
        breed,
        commonRisks: [
          "Displasia de cadera",
          "Problemas oculares hereditarios",
          "Predisposición a sobrepeso"
        ],
        geneticDiversity: "Moderada"
      },

      riskAnalysis: {
        level: "Moderado",
        details: [
          {
            risk: "Displasia de cadera",
            probability: "Media",
            impact: "Alto",
            notes:
              "Se recomienda evaluación radiográfica de ambos progenitores antes del cruce."
          },
          {
            risk: "Problemas oculares hereditarios",
            probability: "Baja",
            impact: "Medio",
            notes:
              "Controlable mediante selección genética adecuada y revisiones oftalmológicas."
          }
        ]
      },

      temperamentPrediction: {
        stability: "Alta",
        sociability: "Alta",
        workDrive: "Media",
        notes:
          "Temperamento equilibrado esperado si se refuerza socialización temprana."
      },

      recommendations: {
        breedingAdvice: [
          "Evitar repetir este cruce en generaciones consecutivas",
          "Priorizar líneas con baja incidencia de displasia",
          "Realizar controles veterinarios previos al cruce"
        ],
        puppySelection: [
          "Seleccionar cachorros con menor reactividad",
          "Evaluar temperamento entre las semanas 6 y 8"
        ],
        longTerm: [
          "Revisar los resultados del cruce antes de integrarlo de forma permanente en el programa de cría"
        ]
      },

      finalDecision: {
        recommended: true,
        conditions: [
          "Controles genéticos previos",
          "Seguimiento veterinario periódico"
        ],
        warning:
          "No recomendado para programas de cría intensivos sin control genético."
      },

      disclaimer:
        "Este análisis es orientativo y no sustituye la evaluación de un veterinario o genetista canino."
    };

    return res.json(response);

  } catch (error) {
    console.error("Error en análisis:", error);
    return res.status(500).json({
      error: "Error interno al generar el análisis"
    });
  }
});

/* =======================
   SERVIDOR
======================= */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`BreedingAI backend escuchando en puerto ${PORT}`);
});


