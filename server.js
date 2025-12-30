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
   CONFIG OPENAI
=========================== */
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

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
  const { raza, objetivo, consanguinidad, antecedentes } = data;

  const breed = BREEDS[raza];
  if (!breed) throw new Error("Raza no soportada");

  let riesgo = breed.baseRisk;
  let compatibilidad = 10 - breed.baseRisk;
  let adecuacion = 5;
  let reglasActivadas = [];

  if (consanguinidad === "moderada") {
    riesgo += 2;
    compatibilidad -= 2;
    reglasActivadas.push("Consanguinidad moderada");
  }

  if (consanguinidad === "alta") {
    riesgo += 4;
    compatibilidad -= 4;
    reglasActivadas.push("Consanguinidad alta");
  }

  antecedentes?.forEach(a => {
    if (breed.problems[a]) {
      riesgo += breed.problems[a];
      compatibilidad -= Math.ceil(breed.problems[a] / 2);
      reglasActivadas.push(`Antecedente: ${a}`);
    }
  });

  if (breed.objectives[objetivo] !== undefined) {
    adecuacion += breed.objectives[objetivo];
    if (breed.objectives[objetivo] < 0) {
      riesgo += Math.abs(breed.objectives[objetivo]);
      reglasActivadas.push("Objetivo de cría penalizado");
    } else {
      reglasActivadas.push("Objetivo de cría compatible");
    }
  }

  riesgo = clamp(riesgo);
  compatibilidad = clamp(compatibilidad);
  adecuacion = clamp(adecuacion);

  let clasificacion = "APTO";
  if (riesgo >= 7) clasificacion = "NO RECOMENDADO";
  else if (riesgo >= 4) clasificacion = "APTO CON CONDICIONES";

  return {
    raza,
    objetivo,
    clasificacion,
    scores: {
      riesgoHereditario: riesgo,
      compatibilidadGenetica: compatibilidad,
      adecuacionObjetivo: adecuacion
    },
    reglasActivadas
  };
}

/* ===========================
   PROMPT IA
=========================== */

function buildPrompt(data) {
  return `
Eres un asesor técnico especializado en programas de cría animal responsable.

Tu función NO es tomar decisiones ni calcular riesgos.
Tu función es EXPLICAR, INTERPRETAR y REDACTAR de forma profesional
los resultados que te proporciona un motor de evaluación independiente.

Nunca contradigas la clasificación ni las puntuaciones recibidas.
Nunca introduzcas riesgos nuevos.

DATOS DEL ANÁLISIS:
- Raza: ${data.raza}
- Objetivo de cría: ${data.objetivo}
- Clasificación final: ${data.clasificacion}
- Riesgo hereditario (0-10): ${data.scores.riesgoHereditario}
- Compatibilidad genética (0-10): ${data.scores.compatibilidadGenetica}
- Adecuación al objetivo (0-10): ${data.scores.adecuacionObjetivo}

REGLAS ACTIVADAS:
${data.reglasActivadas.map(r => `- ${r}`).join("\n")}

Genera un informe profesional estructurado con:
1. Resumen ejecutivo
2. Análisis técnico explicado
3. Implicaciones prácticas
4. Recomendaciones
5. Advertencia final
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
          { role: "system", content: "Eres un experto en cría animal responsable." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();
    const reportText = data.choices[0].message.content;

    res.json({
      success: true,
      resultado: evaluation,
      informe: reportText
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Error al generar el informe"
    });
  }
});

/* ===========================
   HEALTH CHECK
=========================== */

app.get("/", (req, res) => {
  res.send("BreedingAI backend operativo con IA");
});

/* ===========================
   SERVER
=========================== */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ BreedingAI backend escuchando en puerto ${PORT}`);
});
