import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   BASE DE CONOCIMIENTO (REAL)
================================ */

const RAZAS = {
  "Golden Retriever": {
    riesgos: {
      displasia: 3,
      oculares: 3,
      respiratorios: 1,
      neurologicos: 1
    },
    perfil: "equilibrado",
    trabajo: 8,
    salud: 7
  },

  "Bulldog Francés": {
    riesgos: {
      displasia: 2,
      oculares: 2,
      respiratorios: 5,
      neurologicos: 2
    },
    perfil: "braquicefálico",
    trabajo: 3,
    salud: 4
  },

  "Border Collie": {
    riesgos: {
      displasia: 2,
      oculares: 2,
      respiratorios: 1,
      neurologicos: 2
    },
    perfil: "trabajo",
    trabajo: 9,
    salud: 7
  }
};

/* ===============================
   MOTOR DE EVALUACIÓN
================================ */

function evaluarCruce({ raza, objetivo, consanguinidad, antecedentes }) {
  const base = RAZAS[raza];

  if (!base) {
    return {
      estado: "NO EVALUABLE",
      compatibilidad: 0,
      riesgoHereditario: 0,
      adecuacionObjetivo: 0,
      recomendacion: "Raza no reconocida en la base de datos.",
      advertencias: ["La raza seleccionada no está registrada."]
    };
  }

  let riesgo = 0;
  let advertencias = [];

  // Riesgos por antecedentes
  antecedentes.forEach(a => {
    riesgo += base.riesgos[a] || 0;
    advertencias.push(`Presencia de antecedente: ${a}`);
  });

  // Consanguinidad
  if (consanguinidad === "Alta") {
    riesgo += 3;
    advertencias.push("Consanguinidad alta incrementa riesgos hereditarios.");
  }
  if (consanguinidad === "Media") riesgo += 1;

  // Compatibilidad base
  let compatibilidad = Math.max(10 - riesgo, 3);

  // Adecuación al objetivo
  let adecuacion =
    objetivo === "Trabajo" ? base.trabajo :
    objetivo === "Salud" ? base.salud :
    6;

  // Clasificación final
  let estado = "APTO";
  if (riesgo >= 7) estado = "NO RECOMENDADO";
  else if (riesgo >= 4) estado = "APTO CON CONDICIONES";

  return {
    estado,
    compatibilidad,
    riesgoHereditario: riesgo,
    adecuacionObjetivo: adecuacion,
    recomendacion:
      estado === "NO RECOMENDADO"
        ? "Cruce desaconsejado por alto riesgo genético."
        : estado === "APTO CON CONDICIONES"
        ? "Cruce viable solo con control genético y seguimiento veterinario."
        : "Cruce recomendable bajo seguimiento estándar.",
    advertencias
  };
}

/* ===============================
   ENDPOINT PRINCIPAL
================================ */

app.post("/analyze", (req, res) => {
  try {
    const { raza, objetivo, consanguinidad, antecedentes } = req.body;

    if (!raza || !objetivo || !consanguinidad) {
      return res.status(400).json({
        error: "Datos incompletos"
      });
    }

    const resultado = evaluarCruce({
      raza,
      objetivo,
      consanguinidad,
      antecedentes: antecedentes || []
    });

    return res.json({
      success: true,
      resultado
    });

  } catch (err) {
    console.error("Error análisis:", err);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
});

/* ===============================
   HEALTH CHECK
================================ */

app.get("/", (req, res) => {
  res.send("BreedingAI backend operativo");
});

/* ===============================
   START SERVER
================================ */

app.listen(PORT, () => {
  console.log(`✅ BreedingAI backend escuchando en puerto ${PORT}`);
});
