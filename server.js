import express from "express";
import cors from "cors";

const app = express();

/* ===========================
   MIDDLEWARE
=========================== */
app.use(cors());
app.use(express.json());

/* ===========================
   BASE DE CONOCIMIENTO
=========================== */

const BREEDS = {
  "Golden Retriever": {
    baseRisk: 4,
    problems: {
      displasia: 3,
      ocular: 2,
      respiratorio: 1,
      neurologico: 2
    },
    objectives: {
      salud: 0,
      temperamento: 1,
      trabajo: -1
    }
  },
  "Bulldog Francés": {
    baseRisk: 7,
    problems: {
      displasia: 1,
      ocular: 1,
      respiratorio: 4,
      neurologico: 2
    },
    objectives: {
      salud: 0,
      temperamento: -1,
      trabajo: -4
    }
  },
  "Border Collie": {
    baseRisk: 3,
    problems: {
      displasia: 2,
      ocular: 1,
      respiratorio: 0,
      neurologico: 2
    },
    objectives: {
      salud: 0,
      temperamento: 2,
      trabajo: 3
    }
  }
};

/* ===========================
   UTILIDADES
=========================== */

function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

/* ===========================
   MOTOR DE REGLAS
=========================== */

function evaluateCross(data) {
  const {
    raza,
    objetivo,
    consanguinidad,
    antecedentes
  } = data;

  const breed = BREEDS[raza];
  if (!breed) {
    throw new Error("Raza no soportada");
  }

  let riesgo = breed.baseRisk;
  let compatibilidad = 10 - breed.baseRisk;
  let adecuacion = 5;

  // Consanguinidad
  if (consanguinidad === "moderada") {
    riesgo += 2;
    compatibilidad -= 2;
  }
  if (consanguinidad === "alta") {
    riesgo += 4;
    compatibilidad -= 4;
  }

  // Antecedentes
  if (antecedentes?.length) {
    antecedentes.forEach((a) => {
      if (breed.problems[a]) {
        riesgo += breed.problems[a];
        compatibilidad -= Math.ceil(breed.problems[a] / 2);
      }
    });
  }

  // Objetivo
  if (breed.objectives[objetivo] !== undefined) {
    adecuacion += breed.objectives[objetivo];
    if (breed.objectives[objetivo] < 0) {
      riesgo += Math.abs(breed.objectives[objetivo]);
    }
  }

  riesgo = clamp(riesgo);
  compatibilidad = clamp(compatibilidad);
  adecuacion = clamp(adecuacion);

  let clasificacion = "APTO";
  if (riesgo >= 7) clasificacion = "NO RECOMENDADO";
  else if (riesgo >= 4) clasificacion = "APTO CON CONDICIONES";

  return {
    clasificacion,
    scores: {
      riesgoHereditario: riesgo,
      compatibilidadGenetica: compatibilidad,
      adecuacionObjetivo: adecuacion
    }
  };
}

/* ===========================
   ENDPOINT PRINCIPAL
=========================== */

app.post("/analyze", (req, res) => {
  try {
    const result = evaluateCross(req.body);

    res.json({
      success: true,
      resultado: result,
      notaTecnica:
        "Este informe es una herramienta de apoyo a la decisión y no sustituye la evaluación veterinaria especializada."
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/* ===========================
   HEALTH CHECK
=========================== */

app.get("/", (req, res) => {
  res.send("BreedingAI backend operativo");
});

/* ===========================
   SERVER
=========================== */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ BreedingAI backend escuchando en puerto ${PORT}`);
});
