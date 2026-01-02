import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Genera análisis profesional con IA
 * NO toca la lógica del motor
 * SOLO mejora texto, profundidad y valor percibido
 */
export async function generateAIAnalysis({
  breed,
  objective,
  consanguinity,
  antecedentes,
  verdict,
  score
}) {
  const antecedentesText =
    antecedentes && antecedentes.length
      ? antecedentes.join(", ")
      : "ninguno identificado";

  const prompt = `
Eres un veterinario genetista y asesor de criadores profesionales.
Especialista en selección genética responsable de perros de raza.

DATOS DEL CRUCE:
- Raza: ${breed}
- Objetivo de cría: ${objective}
- Consanguinidad: ${consanguinity}
- Antecedentes genéticos: ${antecedentesText}
- Resultado técnico previo: ${verdict}
- Puntuación de riesgo: ${score} sobre 10

INSTRUCCIONES:
1. Redacta un análisis PROFESIONAL, claro y profundo.
2. Explica riesgos genéticos reales y consecuencias prácticas.
3. Usa lenguaje técnico, pero comprensible para criadores expertos.
4. No menciones que eres una IA.
5. Devuelve DOS bloques:
   - "explanation": análisis detallado
   - "recommendation": recomendación experta clara y accionable
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un experto genetista canino." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 350
    });

    const text = completion.choices[0].message.content;

    // Separación simple y robusta
    const [explanationPart, recommendationPart] = text.split("Recomendación:");

    return {
      explanation: explanationPart.trim(),
      recommendation: recommendationPart
        ? recommendationPart.trim()
        : "Se recomienda evaluación genética individualizada."
    };

  } catch (error) {
    console.error("OPENAI ERROR:", error);

    // Fallback seguro (NO rompe nada)
    return {
      explanation:
        "El análisis técnico indica un nivel de riesgo acorde a los parámetros seleccionados. Se recomienda interpretar el resultado junto a información genealógica adicional.",
      recommendation:
        "Consultar con un veterinario genetista antes de realizar el cruce."
    };
  }
}
