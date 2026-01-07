// rules/engine.js

import { breeds } from "./breeds.js";

/**
 * Motor determinista de análisis de cruce
 * NO usa IA
 * Devuelve siempre la misma estructura
 */
export function analyze(input) {
  const {
    breed,
    objective,
    consanguinity,
    antecedentes = []
  } = input;

  let score = 0;
  const factors = [];
  const alerts = [];

  // Consanguinidad
  if (consanguinity === "Alta") {
    score += 4;
    alerts.push("Consanguinidad elevada con aumento del riesgo genético.");
  } else if (consanguinity === "Media") {
    score += 2;
    factors.push("Consanguinidad moderada.");
  } else {
    factors.push("Consanguinidad baja.");
  }

  // Antecedentes
  if (antecedentes.length > 0) {
    score += antecedentes.length * 2;
    alerts.push(
      `Antecedentes presentes: ${antecedentes.join(", ")}.`
    );
  }

  // Riesgos por raza
  const breedInfo = breeds[breed];
  if (breedInfo?.risks) {
    breedInfo.risks.forEach(risk => {
      if (antecedentes.includes(risk)) {
        score += 1;
        alerts.push(`Riesgo genético conocido en la raza: ${risk}.`);
      }
    });
  }

  // Veredicto
  let verdict = "RIESGO BAJO";
  if (score >= 7) verdict = "RIESGO ALTO";
  else if (score >= 4) verdict = "RIESGO MODERADO";

  // Recomendación
  let recommendation = "Cruce aceptable bajo seguimiento veterinario estándar.";
  if (verdict === "RIESGO MODERADO") {
    recommendation =
      "Recomendado realizar pruebas genéticas preventivas antes del cruce.";
  }
  if (verdict === "RIESGO ALTO") {
    recommendation =
      "Cruce desaconsejado sin estudios genéticos exhaustivos y asesoramiento profesional.";
  }

  return {
    verdict,
    score,
    factors,
    alerts,
    recommendation
  };
}


