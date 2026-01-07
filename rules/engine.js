import OpenAI from "openai";
import breeds from "./breeds.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyze(data) {
  const { raza, objetivo, consanguinidad, antecedentes } = data;

  const breedInfo = breeds[raza] || "Raza sin información genética documentada.";

  const prompt = `
Eres un veterinario especialista en genética canina y reproducción responsable.
Redacta un INFORME CLÍNICO PROFESIONAL, claro, riguroso y estructurado.

CONTEXTO DEL CASO:
- Raza: ${raza}
- Información genética conocida de la raza: ${breedInfo}
- Objetivo de cría: ${objetivo}
- Nivel de consanguinidad: ${consanguinidad}
- Antecedentes genéticos detectados: ${antecedentes.length ? antecedentes.join(", ") : "Ninguno conocido"}

INSTRUCCIONES:
1. Evalúa la viabilidad clínica del cruce.
2. Determina un VEREDICTO CLÍNICO (RIESGO BAJO / MODERADO / ALTO).
3. Asigna un ÍNDICE DE RIESGO de 0 a 10.
4. Redacta un ANÁLISIS CLÍNICO DETALLADO (mínimo 2 párrafos).
5. Finaliza con una RECOMENDACIÓN PROFESIONAL clara y accionable.

FORMATO DE RESPUESTA (JSON ESTRICTO):
{
  "verdict": "",
  "score": 0,
  "analysis": "",
  "recommendation": ""
}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: "Eres un veterinario genetista experto." },
      { role: "user", content: prompt }
    ]
  });

  const raw = completion.choices[0].message.content;

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Respuesta de IA no válida");
  }
}
