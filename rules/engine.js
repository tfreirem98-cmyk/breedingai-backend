/**
 * Motor experto de análisis de cruce
 * Este archivo NO usa IA.
 * Genera un diagnóstico profesional interpretable.
 */

import { BREEDS } from "./breeds.js";

export function analyzeCross({
  raza,
  objetivo,
  consanguinidad,
  antecedentes
}) {
  const breedData = BREEDS[raza] || null;

  let score = 0;
  const factors = [];
  const alerts = [];

  // =========================
  // CONSANGUINIDAD
  // =========================
  if (consanguinidad === "Alta") {
    score += 4;
    factors.push("Consanguinidad alta incrementa el riesgo de expresión genética recesiva.");
    alerts.push("Consanguinidad elevada: se recomienda introducir sangre externa.");
  }

  if (consanguinidad === "Media") {
    score += 2;
    factors.push("Consanguinidad media requiere planificación genética.");
  }

  if (consanguinidad === "Baja") {
    score += 1;
    factors.push("Consanguinidad baja considerada adecuada.");
  }

  // =========================
  // ANTECEDENTES
  // =========================
  antecedentes.forEach(a => {
    score += 1.5;
    factors.push(`Antecedente identificado: ${a}.`);
  });

  // =========================
  // RAZA (CONOCIMIENTO EXPERTO)
  // =========================
  if (breedData) {
    if (breedData.riskLevel === "alto") {
      score += 2;
      alerts.push(
        `La raza ${raza} presenta predisposición genética elevada.`
      );
    }

    antecedentes.forEach(a => {
      if (breedData.commonIssues.includes(a)) {
        score += 2;
        alerts.push(
          `El antecedente ${a} es especialmente relevante en la raza ${raza}.`
        );
      }
    });
  }

  // =========================
  // OBJETIVO DE CRÍA
  // =========================
  if (objetivo === "Exposición" && consanguinidad !== "Baja") {
    score += 1;
    alerts.push(
      "Objetivo de exposición con consanguinidad no baja puede comprometer la salud."
    );
  }

  if (objetivo === "Trabajo" && breedData?.workSensitive) {
    alerts.push(
      `La raza ${raza} requiere especial atención funcional para trabajo.`
    );
  }

  // =========================
  // NORMALIZACIÓN
  // =========================
  if (score > 10) score = 10;

  let verdict = "RIESGO BAJO";
  if (score >= 4 && score < 7) verdict = "RIESGO MODERADO";
  if (score >= 7) verdict = "RIESGO ALTO";

  // =========================
  // SALIDA PROFESIONAL
  // =========================
  return {
    verdict,
    score,
    factors,
    alerts,
    summary: generateSummary(verdict, raza, objetivo)
  };
}

function generateSummary(verdict, raza, objetivo) {
  if (verdict === "RIESGO BAJO") {
    return `El cruce propuesto para la raza ${raza} es adecuado para un objetivo de ${objetivo.toLowerCase()}, siempre que se mantenga un control genético básico.`;
  }

  if (verdict === "RIESGO MODERADO") {
    return `El cruce presenta un riesgo moderado que requiere planificación genética y seguimiento profesional para un objetivo de ${objetivo.toLowerCase()}.`;
  }

  return `El cruce para la raza ${raza} presenta un riesgo elevado y no se recomienda sin estudios genéticos exhaustivos previos.`;
}
