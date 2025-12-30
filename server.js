import express from "express";
import cors from "cors";

const app = express();

/* ===============================
   CONFIGURACIÓN GLOBAL
================================ */

app.use(express.json());

app.use(
  cors({
    origin: [
      "https://breedingai-frontend-two.vercel.app",
      "http://localhost:3000",
      "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// IMPORTANTE: preflight
app.options("*", cors());

/* ===============================
   ENDPOINT PRINCIPAL
================================ */

app.post("/analyze", (req, res) => {
  try {
    const { breed, objective, consanguinity, antecedentes } = req.body;

    if (!breed || !objective || !consanguinity) {
      return res.status(400).json({
        error: "Datos incompletos para el análisis",
      });
    }

    // ---- Lógica base (estable) ----
    let compatibilidad = 10;
    let riesgo = 0;
    let adecuacion = 7;

    if (consanguinity === "Media") riesgo += 2;
    if (consanguinity === "Alta") riesgo += 4;

    if (antecedentes?.includes("Displasia")) riesgo += 3;
    if (antecedentes?.includes("Respiratorios")) riesgo += 3;
    if (antecedentes?.includes("Oculares")) riesgo += 2;
    if (antecedentes?.includes("Neurologicos")) riesgo += 4;

    compatibilidad = Math.max(1, 10 - riesgo);
    adecuacion = objective === "Trabajo" ? 8 : 7;

    let clasificacion = "APTO";
    let recomendacion =
      "Cruce recomendable bajo criterios genéticos estándar.";

    if (riesgo >= 5) {
      clasificacion = "APTO CON CONDICIONES";
      recomendacion =
        "Cruce viable solo con control genético avanzado y seguimiento veterinario.";
    }

    if (riesgo >= 8) {
      clasificacion = "NO RECOMENDADO";
      recomendacion =
        "Cruce desaconsejado por alto riesgo hereditario.";
    }

    return res.json({
      clasificacion,
      compatibilidadGenetica: compatibilidad,
      riesgoHereditario: riesgo,
      adecuacionObjetivo: adecuacion,
      recomendacion,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error interno en el análisis",
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
   EXPORT PARA VERCEL
================================ */

export default app;


