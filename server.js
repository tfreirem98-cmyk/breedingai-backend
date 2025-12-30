import express from "express";
import cors from "cors";

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   UTILIDADES
================================ */
function normalizarTexto(valor) {
  if (!valor) return "";
  return valor.toString().trim().toLowerCase();
}

function asegurarArray(valor) {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor;
  return [valor];
}

/* ===============================
   MOTOR DE REGLAS PROFESIONAL
================================ */
function evaluarCruce({ raza, objetivo, consanguinidad, antecedentes }) {
  let compatibilidad = 7;
  let riesgo = 5;
  let adecuacion = 7;

  const razaNorm = normalizarTexto(raza);
  const objetivoNorm = normalizarTexto(objetivo);
  const consangNorm = normalizarTexto(consanguinidad);
  const antecedentesArr = asegurarArray(antecedentes).map(normalizarTexto);

  /* --- AJUSTES POR RAZA --- */
  if (razaNorm.includes("golden")) {
    riesgo += antecedentesArr.includes("displasia") ? 2 : 0;
    adecuacion += objetivoNorm === "salud" ? 1 : 0;
  }

  if (razaNorm.includes("bulldog")) {
    riesgo += antecedentesArr.includes("respiratorios") ? 3 : 1;
    compatibilidad -= 1;
  }

  if (razaNorm.includes("border")) {
    adecuacion += objetivoNorm === "trabajo" ? 2 : 0;
  }

  /* --- CONSANGUINIDAD --- */
  if (consangNorm.includes("alta")) riesgo += 3;
  if (consangNorm.includes("media")) riesgo += 1;
  if (consangNorm.includes("baja")) riesgo -= 1;

  /* --- ANTECEDENTES --- */
  if (antecedentesArr.includes("oculares")) riesgo += 1;
  if (antecedentesArr.includes("neurologicos")) riesgo += 2;

  /* --- LIMITES --- */
  compatibilidad = Math.max(1, Math.min(10, compatibilidad));
  riesgo = Math.max(1, Math.min(10, riesgo));
  adecuacion = Math.max(1, Math.min(10, adecuacion));

  /* --- CLASIFICACION --- */
  let clasificacion = "APTO";
  if (riesgo >= 7) clasificacion = "NO RECOMENDADO";
  else if (riesgo >= 4) clasificacion = "APTO CON CONDICIONES";

  return {
    clasificacion,
    compatibilidad,
    riesgo,
    adecuacion,
    recomendacion:
      clasificacion === "APTO"
        ? "Cruce adecuado siguiendo buenas prácticas de selección."
        : clasificacion === "APTO CON CONDICIONES"
        ? "Cruce viable con control genético y seguimiento veterinario."
        : "No recomendable para programas de cría responsable.",
  };
}

/* ===============================
   ENDPOINT PRINCIPAL
================================ */
app.post("/analyze", (req, res) => {
  try {
    const {
      raza = "",
      objetivo = "salud",
      consanguinidad = "baja",
      antecedentes = [],
    } = req.body || {};

    const resultado = evaluarCruce({
      raza,
      objetivo,
      consanguinidad,
      antecedentes,
    });

    res.json({
      ok: true,
      input: { raza, objetivo, consanguinidad, antecedentes },
      resultado,
      fecha: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en /analyze:", error);
    res.status(500).json({
      ok: false,
      error: "Error interno al generar el análisis",
    });
  }
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("✅ BreedingAI backend activo");
});

/* ===============================
   SERVER
================================ */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ BreedingAI backend escuchando en puerto ${PORT}`);
});
