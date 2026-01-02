import breeds from "./breeds.js";

function calculateScore({ breed, objective, consanguinity, antecedentes }) {
  let score = 0;

  // Consanguinidad
  if (consanguinity === "Alta") score += 4;
  if (consanguinity === "Media") score += 2;

  // Antecedentes
  score += antecedentes.length * 1.5;

  // Riesgos por raza
  const breedData = breeds[breed];
  if (breedData) {
    antecedentes.forEach((a) => {
      if (breedData.risks.includes(a)) score += 1;
    });
  }

  // Objetivo salud penaliza riesgos
  if (objective === "Salud" && score > 5) score += 1;

  return Math.min(Math.round(score), 10);
}

function getVerdict(score) {
  if (score <= 3) return "RIESGO BAJO";
  if (score <= 6) return "RIESGO MODERADO";
  return "RIESGO ALTO";
}

function generateIAReport({ breed, objective, consanguinity, antecedentes, score, verdict }) {
  const antecedentesTxt =
    antecedentes.length > 0 ? antecedentes.join(", ") : "no se han detectado antecedentes relevantes";

  return `
El modelo de análisis ha evaluado el cruce propuesto para la raza <strong>${breed}</strong> considerando de forma conjunta
el nivel de consanguinidad, el objetivo de cría declarado y los antecedentes genéticos conocidos.

Se observa un nivel de <strong>consanguinidad ${consanguinity.toLowerCase()}</strong> junto con un objetivo de cría enfocado en
<strong>${objective.toLowerCase()}</strong>, lo que sitúa este cruce en un contexto que requiere especial atención preventiva.

A nivel genético, se han identificado antecedentes relacionados con <strong>${antecedentesTxt}</strong>.
La interacción entre estos factores incrementa el riesgo potencial de transmisión hereditaria en generaciones posteriores,
especialmente en programas de cría continuados.

Desde una perspectiva genética aplicada, este patrón es compatible con un escenario de <strong>${verdict.toLowerCase()}</strong>,
siendo recomendable adoptar medidas de control adicionales antes de avanzar.
`.trim();
}

function generateRecommendation({ verdict, consanguinity }) {
  if (verdict === "RIESGO BAJO") {
    return "Cruce considerado aceptable dentro de programas de cría responsables, recomendándose seguimiento básico y control periódico.";
  }

  if (verdict === "RIESGO MODERADO") {
    return "Se recomienda realizar pruebas genéticas preventivas y reducir la consanguinidad en futuros cruces para minimizar riesgos acumulativos.";
  }

  return "Cruce desaconsejado sin estudios genéticos exhaustivos, validación veterinaria especializada y planificación reproductiva avanzada.";
}

export function analyzeCross(data) {
  const score = calculateScore(data);
  const verdict = getVerdict(score);

  return {
    verdict,
    score,
    description: generateIAReport({
      ...data,
      score,
      verdict,
    }),
    recommendation: generateRecommendation({
      verdict,
      consanguinity: data.consanguinity,
    }),
  };
}
