import OpenAI from "openai";
import { breedsContext } from "./breeds.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function runAnalysis({
  breed,
  objective,
  consanguinity,
  antecedentes
}) {
  const breedInfo = breedsContext[breed] || {
    description: "Raza sin información específica en la base de datos.",
    knownIssues: []
  };

  const systemPrompt = `
Eres un veterinario genetista experto en cría canina responsable.
Tu trabajo es evaluar riesgos genéticos, bienestar animal y sostenibilidad de líneas de cría.
No des respuestas genéricas ni vagas.
Justifica siempre tus conclusiones de forma técnica pero comprensible.
`;

  const userPrompt = `
Datos del cruce propuesto:

Raza: ${breed}
Descripción de la raza: ${breedInfo.description}
Problemas conocidos de la raza: ${breedInfo.knownIssues.join(", ")}

Objetivo de cría: ${objective}
Nivel de consanguinidad declarado: ${consanguinity}
Antecedentes genéticos detectados: ${antecedentes.length > 0 ? antecedentes.join(", ") : "Ninguno"}

Tareas:
1. Evalúa el riesgo global del cruce (BAJO, MODERADO o ALTO).
2. Explica el razonamiento genético de forma detallada.
3. Señala factores críticos y alertas relevantes.
4. Da una recomendación profesional clara y accionable.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  return response.choices[0].message.content;
}

