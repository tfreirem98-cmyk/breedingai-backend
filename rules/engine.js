import { BREEDS } from "./breeds.js";

export function analyzeBreeding({ breed, goal, inbreeding, conditions }) {
  const breedData = BREEDS[breed] || { baseRisk: 3, risks: [] };

  let riskScore = breedData.baseRisk;

  // Consanguinidad
  if (inbreeding === "Alta") riskScore += 3;
  if (inbreeding === "Media") riskScore += 1;

  // Antecedentes
  riskScore += conditions.length * 2;

  // Objetivo
  if (goal === "Belleza") riskScore += 1;
  if (goal === "Trabajo") riskScore += 1;

  let verdict = "APTO";
  if (riskScore >= 8) verdict = "NO RECOMENDADO";
  else if (riskScore >= 5) verdict = "RIESGO MODERADO";

  return {
    verdict,
    riskScore,
    explanation: `Evaluación basada en raza, consanguinidad y antecedentes. Nivel de riesgo: ${verdict}.`,
    recommendations: verdict !== "APTO"
      ? "Se recomienda test genético y reducir consanguinidad."
      : "Cruce compatible según criterios actuales."
  };
}
