import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   MOTOR DE REGLAS PROFESIONAL
================================ */

function evaluarCruce(data) {
  const {
    raza,
    objetivo,
    consanguinidad,
    antecedentes
  } = data;

  let riesgo = 0;
  let compatibilidad = 10;
  let adecuacion = 10;
  let observaciones = [];
  let advertencias = [];

  // 1. CONSANGUINIDAD
  if (consanguinidad === "media") {
    riesgo += 2;
    compatibilidad -= 1;
    observaciones.push("Consanguinidad media incrementa riesgo de patologías recesivas.");
  }

  if (consanguinidad === "alta") {
    riesgo += 4;
    compatibilidad -= 3;
    advertencias.push("Consanguinidad alta desaconsejada sin pruebas genéticas.");
  }

  // 2. ANTECEDENTES
  if (antecedentes.includes("displasia")) {
    riesgo += 3;
    compatibilidad -= 2;
  }

  if (antecedentes.includes("respiratorios")) {
    riesgo += 2;
  }

  if (antecedentes.includes("oculares")) {
    riesgo += 2;
  }

  if (antecedentes.includes("neurologicos")) {
    riesgo += 3;
    compatibilidad -= 2;
  }

  // 3. OBJETIVO DE CRÍA
  if (objetivo === "trabajo" && raza === "Bulldog Francés") {
    adecuacion -= 4;
    advertencias.push("Raza poco adecuada para trabajo funcional.");
  }

  if (objetivo === "salud" && riesgo > 5) {
    adecuacion -= 3;
  }

  // NORMALIZACIÓN
  riesgo = Math.min(10, riesgo);
  compatibilidad = Math.max(0, compatibilidad);
  adecuacion = Math.max(0, adecuacion);

  // CLASIFICACIÓN FINAL
  let clasificacion = "APTO";
  if (riesgo >= 6) clasificacion = "APTO CON CONDICIONES";
  if (riesgo >= 8 || compatibilidad <= 3) clasificacion = "NO RECOMENDADO";

  return {
    clasificacion,
    puntuaciones: {
      riesgoHereditario: riesgo,
      compatibilidadGenetica: compatibilidad,
      adecuacionObjetivo: adecuacion
    },
    observaciones,
    advertencias,
    recomendacion:
      clasificacion === "APTO"
        ? "Cruce recomendable bajo seguimiento estándar."
        : clasificacion === "APTO CON CONDICIONES"
        ? "Cruce viable solo con control genético y seguimiento veterinario."
        : "Cruce desaconsejado para programas de cría responsables.",
    notaTecnica:
      "Este informe es orientativo y no sustituye pruebas genéticas ni valoración veterinaria especializada.",
    nivelConfianza:
      riesgo <= 3 ? "Alta" : riesgo <= 6 ? "Media" : "Baja"
  };
}

/* ===============================
   ENDPOINT PRINCIPAL
================================ */

app.post("/analyze", (req, res) => {
  try {
    const resultado = evaluarCruce(req.body);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error en análisis profesional" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log("🧬 BreedingAI backend activo en puerto", PORT)
);
