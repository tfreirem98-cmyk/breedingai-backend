// rules/engine.js

import { breeds } from "./breeds.js";

/**
 * Motor de análisis de cruces
 * ⚠️ IMPORTANTE:
 * - NO cambia la estructura de salida
 * - NO rompe compatibilidad con frontend/backend
 * - Solo mejora profundidad y calidad del análisis
 */

export function analyzeCross({
  breed,
  objective,
  consanguinity,
  antecedentes = [],
}) {
  let score = 0;
  const breedData = breeds[breed] || {};

  /* =========================
     1. RIESGO POR CONSANGUINIDAD
     ========================= */
  if (consanguinity === "Alta") score += 4;
  if (consanguinity === "Media") score += 2;
  if (consanguinity === "Baja") score += 0;

  /* =========================
     2. RIESGO POR ANTECEDENTES
     ========================= */
  const antecedentesScore = antecedentes.length * 1.5;
  score += antecedentesScore;

  /* =========================
     3. AJUSTE POR OBJETIVO DE CRÍA
     ========================= */
  if (objective === "Salud" && antecedentes.length > 0) {
    score += 1;
  }
  if (objective === "Trabajo" && consanguinity === "Alta") {
    score += 1;
  }

  /* =========================
     4. RIESGO BASE DE LA RAZA
     ========================= */
  if (breedData.baseRisk) {
    score += breedData.baseRisk;
  }

  /* =========================
     5. NORMALIZAR SCORE
     ========================= */
  score = Math.min(Math.round(score), 10);

  /* =========================
     6. VEREDICTO
     ========================= */
  let veredicto = "RIESGO BAJO";
  if (score >= 4 && score <= 6) veredicto = "RIESGO MODERADO";
  if (score >= 7) veredicto = "RIESGO ALTO";

  /* =========================
     7. DESCRIPCIÓN PROFESIONAL
     ========================= */
  const antecedentesTexto =
    antecedentes.length > 0
      ? `Se han identificado antecedentes genéticos relevantes (${antecedentes.join(
          ", "
        )}), lo que incrementa el riesgo potencial en la descendencia.`
      : `No se han reportado antecedentes genéticos relevantes, lo que reduce la probabilidad de transmisión de patologías hereditarias.`;

  const consanguinityTexto = {
    Alta: "un nivel de consanguinidad elevado, lo que aumenta la probabilidad de expresión de enfermedades recesivas",
    Media:
      "un nivel de consanguinidad moderado, que requiere especial atención en la selección genética",
    Baja: "un nivel de consanguinidad bajo, considerado favorable desde el punto de vista genético",
  }[consanguinity];

  const descripcion = `
El cruce propuesto para la raza ${breed} presenta ${consanguinityTexto} y está orientado a un objetivo de cría enfocado en ${objective.toLowerCase()}.

${antecedentesTexto}

Desde una perspectiva técnica, este cruce debe evaluarse teniendo en cuenta la combinación entre consanguinidad, antecedentes conocidos y el objetivo de selección, ya que estos factores influyen directamente en la salud, viabilidad y calidad genética de la descendencia.
`.trim();

  /* =========================
     8. RECOMENDACIÓN EXPERTA
     ========================= */
  let recomendacion = "";

  if (veredicto === "RIESGO BAJO") {
    recomendacion = `
El cruce puede considerarse aceptable desde un punto de vista genético general. Se recomienda mantener controles veterinarios estándar y registrar la evolución de la descendencia para confirmar la estabilidad del linaje.
`.trim();
  }

  if (veredicto === "RIESGO MODERADO") {
    recomendacion = `
Se recomienda realizar pruebas genéticas específicas antes de llevar a cabo el cruce, así como reducir futuros niveles de consanguinidad mediante la selección cuidadosa de reproductores. El asesoramiento profesional es altamente aconsejable.
`.trim();
  }

  if (veredicto === "RIESGO ALTO") {
    recomendacion = `
Cruce desaconsejado sin la realización previa de estudios genéticos exhaustivos y asesoramiento especializado. Existe un riesgo elevado de transmisión de patologías hereditarias que podría comprometer seriamente la salud de la descendencia.
`.trim();
  }

  /* =========================
     9. SALIDA (NO TOCAR)
     ========================= */
  return {
    veredicto,
    score,
    descripcion,
    recomendacion,
  };
}

