import OpenAI from "openai";
import { breeds } from "./breeds.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function runAnalysis({ raza, objetivo, consanguinidad, antecedentes }) {
  // --- 1. SCORE BASE (determinista, seguro) ---
  let score = 0;

  if (consanguinidad === "Alta") score += 5;
  if (consanguinidad === "Media") score += 3;

  score += antecedentes.length * 2;

  let verdict = "RIESGO BAJO";
  if (score >= 7) verdict = "RIESGO ALTO";
  else if (score >= 4) verdict = "RIESGO MODERADO";

  // --- 2. CONTEXTO TÉCNICO PARA LA IA ---
  const breedInfo = breeds[raza];

  const systemPrompt = `
Eres un genetista canino senior y asesor de criaderos profesionales.
Tu tarea es evaluar cruces de forma crítica, clara y honesta.
No exageres, pero tampoco suavices riesgos.
Escribe análisis profesionales, estructurados y accionables.
`;

  const userPrompt = `
Raza: ${raza}
Objetivo de cría: ${objetivo}
Nivel de consanguinidad: ${consanguinidad}
Antecedentes marcados: ${antecedentes.join(", ") || "Ninguno"}

Riesgos conocidos de la raza:
${breedInfo ? breedInfo.description : "No especificados"}

Puntuación de riesgo calculada: ${score} (${verdict})

Redacta un informe profesional con esta estructura:

1. Resumen ejecutivo
2. Evaluación genética específica de la raza
3. Impacto de la consanguinidad en este cruce
4. Alertas críticas
5. Recomendaciones técnicas concretas
6. Conclusión profesional
`;

  // --- 3. LLAMADA A OPENAI ---
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.4
  });

  const analysisText = completion.choices[0].message.content;

  // --- 4. RESPUESTA FINAL (FRONTEND COMPATIBLE) ---
  return {
    verdict,
    score,
    analysis: analysisText
  };
}

