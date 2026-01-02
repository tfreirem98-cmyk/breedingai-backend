import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateAIAnalysis({
  breed,
  objective,
  consanguinity,
  antecedentes,
  riskScore,
  verdict
}) {
  const antecedentesTexto =
    antecedentes.length > 0
      ? antecedentes.join(", ")
      : "ninguno identificado";

  const prompt = `
Eres un experto en genética canina y asesoramiento a criadores profesionales.

Analiza el siguiente cruce:

- Raza: ${breed}
- Objetivo de cría: ${objective}
- Consanguinidad: ${consanguinity}
- Antecedentes genéticos: ${antecedentesTexto}
- Puntuación de riesgo: ${riskScore}
- Veredicto: ${verdict}

Genera:
1) Un análisis técnico-profesional claro y detallado (2–3 párrafos).
2) Alertas genéticas relevantes si existen.
3) Recomendaciones prácticas para el criador.

Usa un tono experto, preciso y profesional. No menciones IA ni OpenAI.
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: "Eres un genetista canino experto." },
      { role: "user", content: prompt }
    ]
  });

  return completion.choices[0].message.content;
}
