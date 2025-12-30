import express from "express";
import cors from "cors";
import { BREEDS } from "./rules/breeds.js";

const app = express();
app.use(cors());
app.use(express.json());

/* =============================
   UTILIDADES
============================= */

function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

/* =============================
   ENDPOINTS
============================= */

app.get("/breeds", (req, res) => {
  res.json({
    breeds: Object.keys(BREEDS)
  });
});

app.post("/analyze", (req, res) => {
  const {
    breed,
    objective,
    consanguinity,
    antecedentes = []
  } = req.body;

  if (!breed || !BREEDS[breed]) {
    return res.status(400).json({ error: "Raza no válida" });
  }

  const breedData = BREEDS[breed];

  /* -----------------------------
     RIESGO HEREDITARIO
  ----------------------------- */
  let riesgo = breedData.baseRisk;

  if (consanguinity === "media") riesgo += 2;
  if (consanguinity === "alta") riesgo += 4;

  antecedentes.forEach(a => {
    if (breedData.commonIssues.includes(a)) riesgo += 2;
    else riesgo += 1;
  });

  riesgo = clamp(riesgo);

  /* -----------------------------
     COMPATIBILIDAD GENÉTICA
  ----------------------------- */
  let compatibilidad = 10 - riesgo;
  compatibilidad = clamp(compatibilidad);

  /* -----------------------------
     ADECUACIÓN AL OBJETIVO
  ----------------------------- */
  let adecuacion = 5;

  if (objective === "salud") adecuacion = breedData.healthAffinity;
  if (objective === "trabajo") adecuacion = breedData.workAffinity;
  if (objective === "morfologia") adecuacion = 6;

  adecuacion = clamp(adecuacion);

  /* -----------------------------
     CLASIFICACIÓN FINAL
  ----------------------------- */
  let clasificacion = "APTO";
  let recomendacion = "Cruce recomendable bajo criterios estándar.";

  if (riesgo >= 7) {
    clasificacion = "APTO CON CONDICIONES";
    recomendacion =
      "Cruce viable únicamente con control genético y seguimiento veterinario.";
  }

  if (riesgo >= 9) {
    clasificacion = "NO RECOMENDADO";
    recomendacion =
      "Cruce no recomendado por alto riesgo hereditario.";
  }

  /* -----------------------------
     RESPUESTA FINAL (ESTABLE)
  ----------------------------- */
  res.json({
    clasificacion,
    scores: {
      riesgoHereditario: riesgo,
      compatibilidadGenetica: compatibilidad,
      adecuacionObjetivo: adecuacion
    },
    recomendacion
  });
});

/* =============================
   START
============================= */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`BreedingAI backend escuchando en puerto ${PORT}`);
});

