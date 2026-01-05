import OpenAI from "openai";
import { breeds } from "./breeds.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyze({ raza, objetivo, consanguinidad, antecedentes }) {
  /* =========================
     1. CÁLCULO BASE (ESTABLE)
  ========================= */
  let score = 0;

  if (consanguinidad === "Alta") score += 4;
  if (consanguinidad === "Media") score += 2;

  score += antecedentes.length * 2;

  const breedInfo = breeds[raza];
  if (breedInfo && breedInfo.risk) {
    score += breedInfo.risk;
  }

  let verdict = "RIESGO BAJO";
  if (score >= 7) verdict = "RIESGO ALTO";
  else if (score >= 4) verdict = "RIESGO MODERADO";

  /* =========================
     2. CONTEXTO PARA LA IA
  ========================= */
  const contextoRaza = breedInfo
    ? breedInfo.description
    : "Raza sin información específica registrada.";

  const antecedentesTexto =
    antecedentes.length > 0 ? antecedentes.join(", ") : "ninguno identificado";

  const systemPrompt = `
Eres un veterinario genetista senior especializado en cría canina responsable.
Asesoras a criadores profesionales.
Das análisis claros, críticos y accionables.
No exageras ni suavizas riesgos.
No usas lenguaje genérico.
`;

  const userPrompt = `
Analiza el siguiente cruce de forma profesional y estructurada.

DATOS DEL CRUCE
Raza: ${raza}
Objetivo de cría: ${objetivo}
Nivel de consanguinidad: ${consanguinidad}
Antecedentes genéticos: ${antecedentesTexto}

CONTEXTO DE LA RAZA
${contextoRaza}

RESULTADO TÉCNICO PREVIO
Puntuación de riesgo: ${score}
Clasificación: ${verdict}

INSTRUCCIONES DE REDACCIÓN
Redacta el informe con las siguientes secciones claras:

1. Resumen ejecutivo (2–3 frases)
2. Evaluación genética específica de la raza
3. Impacto del nivel de consanguinidad en este cruce
4. Alertas críticas que un criador debe conocer
5. Recomendaciones técnicas concretas y accionables
6. Conclusión profesional clara

No menciones que eres una IA.
No repitas los datos de entrada de forma literal.
Escribe como un experto real.
`;

  /* =========================
     3. LLAMADA A OPENAI
  ========================= */
  let analysisText = "";
  let recommendationText = "";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const fullText = completion.choices[0].message.content;

    // Separación simple: recomendación al final
    const parts = fullText.split("5.");
    analysisText = parts[0].trim();
    recommendationText = parts[1]
      ? parts[1].replace("Recomendaciones técnicas concretas y accionables", "").trim()
      : "Se recomienda asesoramiento genético individualizado antes del cruce.";

  } catch (error) {
    console.error("OpenAI error:", error);

    analysisText =
      "El análisis indica un nivel de riesgo acorde a los parámetros seleccionados. Se recomienda interpretar el resultado junto con información genealógica y pruebas genéticas adicionales.";

    recommendationText =
      "Consultar con un veterinario genetista antes de proceder con el cruce.";
  }

  /* =========================
     4. RESPUESTA FINAL
     (FRONTEND 100% COMPATIBLE)
  ========================= */
  return {
    verdict,
    score,
    explanation: analysisText,
    recommendation: recommendationText
  };
}


