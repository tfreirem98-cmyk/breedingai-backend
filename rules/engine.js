import { breeds } from "./breeds.js";

/**
 * Motor base de análisis (reglas determinísticas)
 * NO IA – estable, predecible, seguro
 */
export function runEngine({ breed, objective, consanguinity, antecedentes }) {
  let score = 0;

  // Consanguinidad
  if (consanguinity === "Alta") score += 4;
  if (consanguinity === "Media") score += 2;

  // Antecedentes
  score += antecedentes.length * 1;

  // Riesgos por raza
  const breedData = breeds[breed];
  if (breedData && breedData.riskLevel === "high") {
    score += 2;
  }

  // Objetivo
  if (objective === "Trabajo") score += 1;

  let verdict = "RIESGO BAJO";
  if (score >= 7) verdict = "RIESGO ALTO";
  else if (score >= 4) verdict = "RIESGO MODERADO";

  return {
    score,
    verdict
  };
}

