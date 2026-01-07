import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Análisis clínico extremo de viabilidad de cruce
 * @param {Object} data
 * @returns {Object} informe clínico estructurado
 */
export async function analyze(data) {
  const {
    raza,
    objetivo,
    consanguinidad,
    antecedentes
  } = data;

  // Normalizamos antecedentes
  const antecedentesTexto =
    antecedentes && antecedentes.length > 0
      ? antecedentes.join(", ")
      : "Ninguno documentado";

  const systemPrompt = `
Eres una inteligencia artificial clínica especializada en genética veterinaria,
medicina reproductiva canina y evaluación de riesgos hereditarios en programas
de cría profesional.

Tu objetivo es generar informes clínicos rigurosos, estructurados y
profesionales, equivalentes a los que elaboraría un veterinario especialista
en reproducción y genética canina.

No eres divulgativo. No eres genérico. No simplificas.
Razonas de forma clínica, técnica y responsable.
`;

  const userPrompt = `
Datos del cruce propuesto:

- Raza: ${raza}
- Objetivo de cría: ${objetivo}
- Nivel de consanguinidad: ${consanguinidad}
- Antecedentes conocidos en el linaje: ${antecedentesTexto}

Genera un informe clínico profesional de viabilidad de cruce.

Formato de salida OBLIGATORIO (JSON puro, sin markdown, sin texto adicional):

{
  "veredicto_clinico": "",
  "indice_riesgo": 0,
  "resumen_ejecutivo": "",
  "perfil_genetico_raza": "",
  "impacto_consanguinidad": "",
  "evaluacion_antecedentes": "",
  "escenarios_descendencia": {
    "favorable": "",
    "intermedio": "",
    "desfavorable": ""
  },
  "recomendacion_clinica_final": "",
  "checklist_veterinario": [
    "",
    "",
    ""
  ]
}

Instrucciones adicionales:
- El veredicto clínico solo puede ser: RIESGO BAJO, RIESGO MODERADO o RIESGO ALTO.
- El índice de riesgo debe estar entre 0 y 10 y ser coherente con el veredicto.
- Cada sección debe ser específica para la raza indicada.
- Si hay antecedentes, su impacto debe reflejarse claramente.
- Lenguaje clínico, profesional y orientado a criadores expertos.
- No utilices frases vagas ni genéricas.
- Razona siempre en términos de transmisión hereditaria, prevención y salud de la descendencia.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const raw = completion.choices[0].message.content;

    // Seguridad: parseo estricto
    const parsed = JSON.parse(raw);

    return parsed;

  } catch (error) {
    console.error("Error en análisis clínico IA:", error);
    throw new Error("No se pudo generar el análisis clínico.");
  }
}

