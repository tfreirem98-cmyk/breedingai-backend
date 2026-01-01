// rules/engine.js

import { BREEDS } from "./breeds.js";

export function analyzeBreeding({
  breed,
  objective,
  consanguinity,
  antecedentes
}) {
  let score = 0;

  // Consanguinidad
  if (consanguinity === "Alta") score += 4;
  if (consanguinity === "Media") score += 2;
  if (consanguinity === "Baja") score += 0;

  // Objetivo
  if (objective === "Trabajo") score += 1;
  if (objective === "Salud") score += 0;
  if (objective === "Exposición") score += 2;

  // Antecedentes
  score += antecedentes.length * 2;

  let veredicto = "RIESGO BAJO";
  if (score >= 4 && score < 7) veredicto = "RIESGO MODERADO";
  if (score >= 7) veredicto = "RIESGO ALTO";

  const descripcion = `Evaluación orientativa basada en raza (${breed}), objetivo (${objective}), consanguinidad (${consanguinity}) y antecedentes.`;

  let recomendacion = "Cruce aceptable con seguimiento básico.";
  if (veredicto === "RIESGO MODERADO") {
    recomendacion = "Se recomienda test genético y reducir consanguinidad.";
  }
  if (veredicto === "RIESGO ALTO") {
    recomendacion =
      "Cruce desaconsejado sin estudios genéticos exhaustivos y asesoramiento profesional.";
  }

  return {
    veredicto,
    score,
    descripcion,
    recomendacion
  };
}

