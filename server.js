import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("BreedingAI backend running");
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { animal, breed, origin, goal } = req.body;

    if (!animal || !breed || !goal) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const prompt = `
Actúa como un ASESOR PROFESIONAL EN CRÍA ANIMAL.
No uses lenguaje ambiguo.
No generalices.
No suavices conclusiones.

DATOS DEL CRUCE
Animal: ${animal}
Raza: ${breed}
Origen genético: ${origin || "No especificado"}
Objetivo de cría: ${goal}

GENERA UN INFORME PROFESIONAL CON ESTE FORMATO EXACTO:

TÍTULO DEL INFORME

CLASIFICACIÓN GENERAL
Indica solo una:
- APTO
- APTO CON CONDICIONES
- NO APTO

PUNTUACIONES (0 a 10)
Compatibilidad genética:
Riesgo hereditario estimado:
Adecuación al objetivo de cría:

ANÁLISIS TÉCNICO
Explica brevemente el razonamiento técnico.

RIESGOS IDENTIFICADOS
Enumera riesgos reales. Si no existen, indícalo claramente.

CONDICIONES DE USO
Indica qué está permitido y qué debe evitarse.

RECOMENDACIÓN PROFESIONAL
Conclusión clara orientada a la decisión.

NIVEL DE CONFIANZA DEL ANÁLISIS
Alta / Media / Baja con explicación breve.

NOTA TÉCNICA
Aclara que el informe es una herramienta de apoyo a la decisión.

Mantén un tono profesional, técnico y responsable.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.25,
        messages: [
          {
            role: "system",
            content:
              "Eres un especialista en genética y cría animal que asesora a profesionales.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "Error generando análisis" });
    }

    res.json({ analysis: data.choices[0].message.content });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("BreedingAI backend running on port " + PORT);
});

