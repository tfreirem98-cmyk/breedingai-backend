import { breeds } from "./breeds.js";

export async function analyze({ raza, objetivo, consanguinidad, antecedentes }) {
  let score = 0;

  // Consanguinidad
  if (consanguinidad === "Alta") score += 4;
  if (consanguinidad === "Media") score += 2;
  if (consanguinidad === "Baja") score += 0;

  // Antecedentes
  score += antecedentes.length * 2;

  // Raza (si existe en breeds)
  const breedInfo = breeds[raza];
  if (breedInfo && breedInfo.risk) {
    score += breedInfo.risk;
  }

  let verdict = "RIESGO BAJO";
  if (score >= 4) verdict = "RIESGO MODERADO";
  if (score >= 7) verdict = "RIESGO ALTO";

  let recommendation = "Cruce aceptable bajo seguimiento veterinario estándar.";
  if (score >= 4) {
    recommendation = "Se recomienda realizar pruebas genéticas preventivas antes del cruce.";
  }
  if (score >= 7) {
    recommendation = "Cruce desaconsejado sin estudios genéticos exhaustivos y asesoramiento profesional.";
  }

  return {
    verdict,
    score,
    explanation: `El cruce propuesto para la raza ${raza} presenta un nivel de consanguinidad ${consanguinidad.toLowerCase()} y está orientado a un objetivo de cría enfocado en ${objetivo.toLowerCase()}. Se han identificado antecedentes genéticos relevantes (${antecedentes.join(", ") || "ninguno"}), lo que influye directamente en el riesgo potencial de la descendencia.`,
    recommendation
  };
}


