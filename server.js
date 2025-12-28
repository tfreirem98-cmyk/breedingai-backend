import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("BreedingAI backend running");
});

// ================= ANALYZE =================
app.post("/api/analyze", async (req, res) => {
  try {
    const { animal, breed, origin, goal } = req.body;

    if (!animal || !breed || !goal) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const prompt = `
Actúa como un ESPECIALISTA EN CRÍA ANIMAL PROFESIONAL.

Tu tarea es asistir a un criador en la toma de decisiones.
NO uses lenguaje genérico ni ambiguo.
NO hagas promesas.
SÉ claro, estructurado y responsable.

DATOS DEL CRUCE:
- Animal: ${animal}
- Raza: ${breed}
- Origen genético: ${origin || "No especificado"}
- Objetivo de la cría: ${goal}

GENERA UN INFORME CON ESTA ESTRUCTURA EXACTA:

TÍTULO DEL INFORME

1. RESUMEN EJECUTIVO
Indica claramente si el cruce es:
- Recomendado
- Recomendado con reservas
- No recomendado

2. OBJETIVO DE CRÍA ANALIZADO
Explica brevemente si el cruce se alinea con el objetivo indicado.

3. RIESGOS DETECTADOS
Enumera riesgos genéticos, de temperamento o de repetición.
Si no hay riesgos claros, indícalo.

4. RECOMENDACIÓN DEL SISTEMA
Explica QUÉ HARÍAS y QUÉ EVITARÍAS como especialista.

5. ALTERNATIVA SUGERIDA (SI APLICA)
Propón una alternativa solo si aporta valor real.

6. NIVEL DE CONFIANZA
Indica: Alta / Media / Baja
y explica brevemente por qué.

Usa un tono profesional, claro y directo.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "Eres un experto en genética y cría animal. Tu función es asistir en decisiones responsables.",
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

    const analysis = data.choices[0].message.content;

    res.json({ analysis });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ================= START =================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("BreedingAI backend running on port " + PORT);
});

