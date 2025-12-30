// rules/engine.js
// Motor profesional de análisis de cría
// Produce resultados coherentes, distintos por raza y útiles para criaderos

import { BREEDS } from "./breeds.js";

export function analyzeBreeding({
  breed,
  objective,
  consanguinity,
  antecedentes = []
}) {
  const data = BREEDS[breed];

  if (!data) {
    throw new Error("Raza no soportada");
  }

  /* ==========================
     BASE DE RIESGO
  ========================== */

  let riesgoHereditario = 0;

  antecedentes.forEach(a => {
    if (data.risks[a] !== undefined) {
      riesgoHereditario += data.risks[a];
    }
  });

  // Consanguinidad
  if (consanguinity === "Media") riesgoHereditario += 2;
  if (consanguinity === "Alta") riesgoHereditario += 4;

  riesgoHereditario = Math.min(10, riesgoHereditario);

  /* ==========================
     COMPATIBILIDAD GENÉTICA
  ========================== */

  let compatibilidadGenetica = 10 - riesgoHereditario;

  if (data.group === "compañia" && objective === "Trabajo") {
    compatibilidadGenetica -= 3;
  }

  if (data.group === "trabajo" && objective === "Exposición") {
    compatibilidadGenetica -= 1;
  }

  compatibilidadGenetica = Math.max(1, compatibilidadGenetica);

  /* ==========================
     ADECUACIÓN AL OBJETIVO
  ========================== */

  let adecuacionObjetivo = 7;

  if (data.strengths.includes(objective.toLowerCase())) {
    adecuacionObjetivo = 9;
  }

  if (riesgoHereditario >= 6) {
    adecuacionObjetivo -= 2;
  }

  adecuacionObjetivo = Math.max(1, adecuacionObjetivo);

  /* ==========================
     CLASIFICACIÓN FINAL
  ========================== */

  let clasificacion = "APTO";
  let etiqueta = "Cruce recomendable bajo criterios estándar.";

  if (riesgoHereditario >= 6) {
    clasificacion = "APTO CON CONDICIONES";
    etiqueta =
      "Cruce viable solo con control genético estricto y seguimiento veterinario.";
  }

  if (riesgoHereditario >= 8) {
    clasificacion = "NO RECOMENDADO";
    etiqueta =
      "Cruce no aconsejado para programas de cría responsable.";
  }

  /* ==========================
     TEXTO PROFESIONAL
  ========================== */

  const informeProfesional = `
La evaluación del cruce para la raza ${breed} muestra un perfil ${
    clasificacion.toLowerCase()
  } en función de los antecedentes indicados y el nivel de consanguinidad.

La compatibilidad genética se considera ${compatibilidadGenetica >= 7 ? "adecuada" : "limitada"}, mientras que el riesgo hereditario requiere ${
    riesgoHereditario >= 6 ? "control específico" : "seguimiento estándar"
  }.

Este cruce ${clasificacion === "APTO" ? "puede realizarse" : "solo debería considerarse"} dentro de un programa de cría responsable, priorizando la salud estructural y la estabilidad genética de la descendencia.
`.trim();

  /* ==========================
     RESPUESTA FINAL
  ========================== */

  return {
    breed,
    clasificacion,
    scores: {
      compatibilidadGenetica,
      riesgoHereditario,
      adecuacionObjetivo
    },
    recomendacion: etiqueta,
    informeProfesional
  };
}
