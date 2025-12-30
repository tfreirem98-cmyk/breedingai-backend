import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

/* ===========================
   MIDDLEWARE
=========================== */
app.use(cors());
app.use(express.json());

/* ===========================
   OPENAI CONFIG
=========================== */
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

/* ===========================
   BASE DE CONOCIMIENTO (PERROS)
=========================== */

const BREEDS = {
  "Golden Retriever": {
    baseRisk: 3,
    risks: {
      displasia: 3,
      ocular: 2
    },
    notes: "Predisposición conocida a displasia de cadera y problemas oculares."
  },
  "Labrador Retriever": {
    baseRisk: 3,
    risks: {
      displasia: 3,
      ocular: 1
    },
    notes: "Riesgo moderado de displasia y problemas articulares."
  },
  "Bulldog Francés": {
    baseRisk: 6,
    risks: {
      respiratorio: 4,
      neurologico: 2
    },
    notes: "Raza braquicefálica con alto riesgo respiratorio."
  },
  "Bulldog Inglés": {
    baseRisk: 7,
    risks: {
      respiratorio: 4,
      displasia: 2
    },
    notes: "Alta carga genética y problemas respiratorios frecuentes."
  },
  "Pastor Alemán": {
    baseRisk: 4,
    risks: {
      displasia: 4
    },
    notes: "Alta incidencia de displasia de cadera."
  },
  "Border Collie": {
    baseRisk: 2,
    risks: {
      neurologico: 2,
      ocular: 1
    },
    notes: "Generalmente sano, pero con riesgo neurológico hereditario."
  },
  "Caniche": {
    baseRisk: 2,
    risks: {
      ocular: 2
    },
    notes: "Riesgo ocular hereditario moderado."
  },
  "Teckel": {
    baseRisk: 4,
    risks: {
      neurologico: 4
    },
    notes: "Alta predisposición a problemas de columna."
  },
  "Yorkshire Terrier": {
    baseRisk: 3,
    risks: {
      respiratorio: 1,
      neurologico: 2
    },
    notes: "Riesgo neurológico moderado."
  },
  "Chihuahua": {
    baseRisk: 3,
    risks: {
      neurologico: 2,
      respiratorio: 1
    },
    notes: "Fragilidad neurológica y craneal."
  },
  "Rottweiler": {
    baseRisk: 4,
    risks: {
      displasia: 4
    },
    notes: "Alta incidencia de displasia."
  },
  "Husky Siberiano": {
    baseRisk: 3,
    risks: {
      ocular: 2
    },
    notes: "Problemas oculares hereditarios conocidos."
  },
  "Otra": {
    baseRisk: 3,
    risks: {},
    notes: "Evaluación genérica sin datos específicos de raza."
  }
};

/* ===========================
   UTILIDADES
=========================== */

const clamp = (v, min = 0, max = 10) => Math.max(min, Math.min(max, v));

/* ===========================
   MOTOR DE REGLAS DEFINITIVO
=========================== */

function evaluateCross(data) {
  const { raza, objetivo, consanguinidad, antecedentes } = data;
  const breed = BREEDS[raza] || BREEDS["Otra"];

  let riesgo = breed.baseRisk;
  let compatibilidad = 10 - riesgo;
  let adecuacion = 5;
  let reglas = [];

  reglas.push(`Perfil racial: ${raza}`);
  reglas.push(breed.notes);

  /* --- Objetivo de cría --- */
  if (objetivo === "salud") {
    riesgo += 1;
    reglas.push("Objetivo salud: evaluación más estricta");
  }
  if (objetivo === "trabajo") {
    adecuacion += 1;
    reglas.push("Objetivo trabajo: se prioriza funcionalidad");
  }

  /* --- Consanguinidad (MULTIPLICADOR) --- */
  let factor = 1;
  if (consanguinidad === "moderada") {
    factor = 1.3;
    reglas.push("Consanguinidad moderada: incremento de riesgo");
  }
  if (consanguinidad === "alta") {
    factor = 1.7;
    reglas.push("Consanguinidad alta: incremento severo de riesgo");
  }

  /* --- Antecedentes --- */
  antecedentes?.forEach(a => {
    if (breed.risks[a]) {
      riesgo += breed.risks[a];
      compatibilidad -= Math.ceil(breed.risks[a] / 2);
      reglas.push(`Antecedente crítico detectado: ${a}`);
    } else {
      riesgo += 1;
      reglas.push(`Antecedente no específico: ${a}`);
    }
  });

  /* --- Aplicar multiplicador --- */
  riesgo = clamp(Math.round(riesgo * factor));
  compatibilidad = clamp(compatibilidad);
  adecuacion = clamp(adecuacion);

  /* --- BLOQUEOS AUTOMÁTICOS --- */
  let clasificacion = "APTO";

  if (
    (raza.includes("Bulldog") && antecedentes?.includes("respiratorio")) ||
    (raza === "Golden Retriever" && antecedentes?.includes("displasia")) ||
    (consanguinidad === "alta" && riesgo >= 7)
  ) {
    clasificacion = "NO RECOMENDADO";
    reglas.push("Bloqueo automático por combinación crítica");
  } else if (riesgo >= 6) {
    clasificacion = "APTO CON CONDICIONES";
  }

  return {
    raza,
    objetivo,
    clasificacion,
    scores: {
      riesgoHereditario: riesgo,
      compatibilidadGenetica: compatibilidad,
      adecuacionObjetivo: adecuacion
    },
    reglasActivadas: reglas
  };
}

/* ===========================
   PROMPT IA (EXPLICATIVO)
=========================== */

function buildPrompt(e) {
  return `
Eres un asesor técnico en cría canina responsable.
NO tomas decisiones, solo explicas resultados.

Datos:
Raza: ${e.raza}
Objetivo: ${e.objetivo}
Clasificación: ${e.clasificacion}
Riesgo: ${e.scores.riesgoHereditario}/10
Compatibilidad: ${e.scores.compatibilidadGenetica}/10
Adecuación: ${e.scores.adecuacionObjetivo}/10

Factores aplicados:
${e.reglasActivadas.map(r => "- " + r).join("\n")}

Redacta un informe profesional, prudente y claro.
`;
}

/* ===========================
   ENDPOINTS
=========================== */

app.post("/analyze", (req, res) => {
  try {
    const result = evaluateCross(req.body);
    res.json({ success: true, resultado: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post("/report", async (req, res) => {
  try {
    const evaluation = evaluateCross(req.body);
    const prompt = buildPrompt(evaluation);

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres un experto en cría canina." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();

    res.json({
      success: true,
      resultado: evaluation,
      informe: data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ success: false, error: "Error al generar informe" });
  }
});

/* ===========================
   SERVER
=========================== */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ BreedingAI backend activo en puerto ${PORT}`);
});
