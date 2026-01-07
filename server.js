import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { analyze } from "./rules/engine.js";

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  try {
    // 1️⃣ Análisis determinista
    const engineResult = analyze(req.body);

    // 2️⃣ Prompt clínico extremo (CLAVE DEL PRODUCTO)
    const prompt = `
Eres un sistema experto en genética canina y cría responsable.
Tu tarea es redactar un INFORME CLÍNICO PROFESIONAL, con lenguaje técnico,
claro y estructurado, dirigido a criadores profesionales.

NO inventes datos.
NO modifiques el score.
NO suavices conclusiones.
NO uses lenguaje divulgativo.

DATOS DEL ANÁLISIS:
- Veredicto: ${engineResult.verdict}
- Puntuación de riesgo: ${engineResult.score} sobre 10
- Factores: ${engineResult.factors.join("; ")}
- Alertas: ${engineResult.alerts.join("; ") || "Ninguna"}
- Raza: ${req.body.raza}
- Objetivo de cría: ${req.body.objetivo}
- Nivel de consanguinidad: ${req.body.consanguinidad}

ESTRUCTURA OBLIGATORIA DEL INFORME:
1. Resumen ejecutivo (decisión clara)
2. Evaluación genética de la raza
3. Impacto del nivel de consanguinidad
4. Análisis de antecedentes detectados
5. Escenarios de descendencia (optimista, probable, desfavorable)
6. Recomendación profesional final
7. Advertencia ética y sanitaria

El informe debe parecer redactado por un comité veterinario experto.
`;

    // 3️⃣ Llamada a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un veterinario especialista en genética canina." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const analysisText = completion.choices[0].message.content;

    // 4️⃣ Respuesta final al frontend
    res.json({
      verdict: engineResult.verdict,
      score: engineResult.score,
      analysisText,
      recommendation: engineResult.recommendation
    });

  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({ error: "Error generando análisis clínico" });
  }
});

app.get("/", (req, res) => {
  res.send("BreedingAI backend running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

