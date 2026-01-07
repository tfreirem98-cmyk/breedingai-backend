import OpenAI from "openai";

/**
 * Motor de análisis clínico avanzado con IA
 * La IA evalúa, razona y decide.
 * Las reglas humanas solo aportan contexto.
 */

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
    throw new Error("Datos incompletos para el análisis");
  }

  const antecedentesText =
    antecedentes && antecedentes.length > 0
      ? antecedentes.join(", ")
      : "No se han reportado antecedentes clínicos conocidos";

  const prompt = `
Actúa como un veterinario especialista en genética canina, reproducción responsable
y evaluación clínica de cruces.

Vas a realizar un INFORME CLÍNICO PROFESIONAL DE VIABILIDAD DE CRUCE.
El informe debe ser técnico, claro, estructurado y orientado a criadores profesionales.

Datos del cruce:
- Raza: ${breed}
- Objetivo de cría: ${objective}
- Nivel de consanguinidad estimado: ${consanguinity}
- Antecedentes clínicos conocidos: ${antecedentesText}

Tareas:
1. Evalúa el riesgo clínico global del cruce.
2. Considera riesgos genéticos conocidos y potenciales.
3. Analiza el impacto del nivel de consanguinidad.
4. Valora la coherencia del objetivo de cría con la raza.
5. Detecta riesgos evidentes y no evidentes.
6. Emite una recomendación profesional clara.

Devuelve el resultado en formato JSON con EXACTAMENTE esta estructura:

{
  "verdict": "RIESGO BAJO | RIESGO MODERADO | RIESGO ALTO",
  "score": número entero del 1 al 10,
  "analysisText": "Informe clínico detallado en español, con secciones, tono profesional y enfoque veterinario",
  "recommendation": "Recomendación final clara y profesional"
}

No incluyas explicaciones fuera del JSON.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: "Eres un experto clínico en genética canina." },
      { role: "user", content: prompt }
    ]
  });

  let content = response.choices[0].message.content;

  // Limpieza defensiva por si OpenAI añade texto extra
  content = content.trim();
  const jsonStart = content.indexOf("{");
  const jsonEnd = content.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Respuesta de IA no válida");
  }

  const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1));

  return {
    verdict: parsed.verdict,
    score: parsed.score,
    analysisText: parsed.analysisText,
    recommendation: parsed.recommendation
  };
}


