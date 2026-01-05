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
     2. CONTEXTO PARA IA
  ========================= */
  const contextoRaza = breedInfo
    ? breedInfo.description
    : "Raza sin información genética específica documentada.";

  const antecedentesTexto =
    antecedentes.length > 0
      ? antecedentes.join(", ")
      : "ninguno identificado";

  const systemPrompt = `
Eres un veterinario genetista senior especializado exclusivamente en cría canina responsable.
Asesoras a criadores profesionales y centros de selección.
Tu análisis debe ser clínico, crítico y honesto.
No suavices riesgos para agradar.
No generalices.
No uses lenguaje divulgativo.
`;

  const userPrompt = `
Evalúa el siguiente cruce como si fueras responsable del programa genético del criadero.

DATOS DEL CRUCE
Raza: ${raza}
Objetivo principal de cría: ${objetivo}
Nivel de consanguinidad declarado: ${consanguinidad}
Antecedentes genéticos conocidos: ${antecedentesTexto}

CONTEXTO DE LA RAZA
${contextoRaza}

RESULTADO TÉCNICO PREVIO
Índice de riesgo estimado: ${score}
Clasificación orientativa: ${verdict}

INSTRUCCIONES DE ANÁLISIS
Redacta un informe profesional estructurado con las siguientes secciones claras:

1. Resumen ejecutivo
   - Viabilidad global del cruce
   - Nivel de riesgo real
   - Condiciones bajo las que sería aceptable o no

2. Evaluación genética específica de la raza
   - Patologías relevantes para esta raza
   - Relación con los antecedentes marcados
   - Riesgos no evidentes para criadores no expertos

3. Impacto del nivel de consanguinidad
   - Consecuencias a corto y largo plazo
   - Riesgos acumulativos
   - Umbrales críticos habituales en esta raza

4. Alertas críticas
   - Errores comunes en criaderos
   - Combinaciones especialmente sensibles
   - Riesgos que deberían descartar el cruce

5. Recomendaciones técnicas
   - Pruebas genéticas concretas
   - Medidas preventivas
   - Alternativas si el cruce no es óptimo

6. Conclusión profesional
   - Recomendación final clara
   - Idoneidad del cruce para cría responsable

No menciones que eres una IA.
No repitas los datos de entrada de forma literal.
Escribe como un experto que asume responsabilidad real.
`;

  /* =========================
     3. OPENAI
  ========================= */
  let explanation = "";
  let recommendation = "";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const fullText = completion.choices[0].message.content;

    // Separar recomendación final (heurística segura)
    const splitIndex = fullText.lastIndexOf("Conclusión");
    explanation =
      splitIndex !== -1
        ? fullText.substring(0, splitIndex).trim()
        : fullText.trim();

    recommendation =
      splitIndex !== -1
        ? fullText.substring(splitIndex).trim()
        : "Consultar con un veterinario genetista antes de proceder.";

  } catch (error) {
    console.error("OpenAI error:", error);

    explanation =
      "El análisis indica un nivel de riesgo acorde a los parámetros seleccionados. Se recomienda interpretar el resultado junto con información genealógica detallada y pruebas genéticas específicas.";

    recommendation =
      "Consultar con un veterinario genetista antes de realizar el cruce.";
  }

  /* =========================
     4. RESPUESTA FINAL
     (NO ROMPE FRONTEND)
  ========================= */
  return {
    verdict,
    score,
    explanation,
    recommendation
  };
}

