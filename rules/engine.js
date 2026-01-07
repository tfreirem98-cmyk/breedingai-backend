import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyze({
  breed,
  objective,
  consanguinity,
  antecedentes
}) {
  if (!breed || !objective || !consanguinity) {
    return fallbackAnalysis();
  }

  const antecedentesText =
    antecedentes && antecedentes.length > 0
      ? antecedentes.join(", ")
      : "No se han reportado antecedentes clínicos conocidos";

  const prompt = `
Eres un veterinario especialista en genética canina y reproducción responsable.

Genera un INFORME CLÍNICO PROFESIONAL DE VIABILIDAD DE CRUCE.

Datos:
- Raza: ${breed}
- Objetivo de cría: ${objective}
- Consanguinidad: ${consanguinity}
- Antecedentes: ${antecedentesText}

Devuelve SOLO JSON con esta estructura exacta:

{
  "verdict": "RIESGO BAJO | RIESGO MODERADO | RIESGO ALTO",
  "score": número del 1 al 10,
  "analysisText": "Informe clínico detallado, estructurado y técnico",
  "recommendation": "Recomendación profesional final"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: "Eres un experto clínico veterinario." },
        { role: "user", content: prompt }
      ]
    });

    let content = response.choices[0].message.content.trim();

    // Limpieza defensiva
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return fallbackAnalysis();
    }

    const parsed = JSON.parse(content.slice(start, end + 1));

    return {
      verdict: parsed.verdict || "RIESGO MODERADO",
      score: parsed.score || 5,
      analysisText: parsed.analysisText || "Análisis clínico no disponible.",
      recommendation:
        parsed.recommendation ||
        "Se recomienda evaluación veterinaria adicional."
    };
  } catch (err) {
    console.error("Error IA:", err.message);
    return fallbackAnalysis();
  }
}

function fallbackAnalysis() {
  return {
    verdict: "RIESGO MODERADO",
    score: 5,
    analysisText:
      "No se ha podido completar el análisis clínico avanzado. El cruce presenta factores que requieren evaluación veterinaria especializada antes de proceder.",
    recommendation:
      "Se recomienda realizar pruebas genéticas preventivas y asesoramiento profesional."
  };
}


