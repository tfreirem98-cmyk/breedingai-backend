/**
 * BreedingAI – Clinical Analysis Engine
 * Versión estable v1.0
 * NO depende de OpenAI
 * NO depende de breeds.js
 * Devuelve estructura clínica normalizada
 */

export function analyzeCross(input) {
  const {
    breed,
    objective,
    consanguinity,
    issues = []
  } = input;

  // -----------------------------
  // 1. BASE RISK POR RAZA (GENÉRICO)
  // -----------------------------
  let baseRisk = 2.0;

  // Ajustes genéricos por raza (expandible sin romper nada)
  const highRiskBreeds = [
    "Akita Inu",
    "Bulldog Francés",
    "Bulldog Inglés",
    "Doberman",
    "Rottweiler",
    "Pastor Alemán"
  ];

  if (highRiskBreeds.includes(breed)) {
    baseRisk += 0.8;
  }

  // -----------------------------
  // 2. IMPACTO DE ANTECEDENTES
  // -----------------------------
  let issuesRisk = 0;

  issues.forEach(issue => {
    switch (issue) {
      case "Oculares":
        issuesRisk += 1.2;
        break;
      case "Displasia":
        issuesRisk += 1.0;
        break;
      case "Respiratorios":
        issuesRisk += 0.9;
        break;
      case "Neurológicos":
        issuesRisk += 1.1;
        break;
      default:
        issuesRisk += 0.3;
    }
  });

  // -----------------------------
  // 3. IMPACTO DE CONSANGUINIDAD
  // -----------------------------
  let consanguinityRisk = 0;

  switch (consanguinity) {
    case "Baja":
      consanguinityRisk = 0.4;
      break;
    case "Media":
      consanguinityRisk = 0.9;
      break;
    case "Alta":
      consanguinityRisk = 1.6;
      break;
    default:
      consanguinityRisk = 0.6;
  }

  // -----------------------------
  // 4. CÁLCULO FINAL
  // -----------------------------
  let riskScore =
    baseRisk +
    issuesRisk +
    consanguinityRisk;

  riskScore = Math.min(10, Math.round(riskScore * 10) / 10);

  // -----------------------------
  // 5. VEREDICTO
  // -----------------------------
  let verdict = "APTO";

  if (riskScore >= 7) {
    verdict = "NO_RECOMENDADO";
  } else if (riskScore >= 4) {
    verdict = "VIABLE_CON_CONDICIONES";
  }

  // -----------------------------
  // 6. ACCIONES OBLIGATORIAS
  // -----------------------------
  const requiredActions = [];

  if (issues.includes("Oculares")) {
    requiredActions.push("test_PRA");
    requiredActions.push("revision_oftalmologica");
  }

  if (issues.includes("Displasia")) {
    requiredActions.push("radiografia_cadera");
  }

  if (consanguinity !== "Baja") {
    requiredActions.push("analisis_COI");
  }

  // -----------------------------
  // 7. SALIDA NORMALIZADA (CLÍNICA)
  // -----------------------------
  return {
    riskScore,
    verdict,
    confidence: 0.85,
    breed,
    objective,
    breedProfile: issues.length ? issues.map(i => i.toLowerCase()) : [],
    declaredIssues: issues,
    consanguinity,
    riskFactors: {
      breedBase: baseRisk,
      declaredIssues: issuesRisk,
      consanguinityImpact: consanguinityRisk
    },
    requiredActions,
    scenarios: ["A", "B", "C"]
  };
}

