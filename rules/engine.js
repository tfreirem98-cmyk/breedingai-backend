const breeds = require("./breeds");

module.exports = function analyze({ breed, goal, consanguinity, antecedentes }) {
  const breedData = breeds[breed];

  if (!breedData) {
    return { error: "Raza no soportada" };
  }

  let riesgo = breedData.risk;
  let compatibilidad = 10 - riesgo;
  let adecuacion = 7;

  // Consanguinidad
  if (consanguinity === "Media") riesgo += 2;
  if (consanguinity === "Alta") riesgo += 4;

  // Antecedentes
  riesgo += antecedentes.length * 1.5;

  // Objetivo de cría
  if (goal === "Salud") {
    adecuacion = 10 - riesgo;
  } else if (goal === "Trabajo") {
    adecuacion = breedData.group === "Pastor" || breedData.group === "Trabajo" ? 9 : 6;
  } else if (goal === "Estética") {
    adecuacion = 7;
    riesgo += 1;
  }

  // Normalización
  riesgo = Math.min(Math.max(riesgo, 0), 10);
  compatibilidad = Math.min(Math.max(compatibilidad, 0), 10);
  adecuacion = Math.min(Math.max(adecuacion, 0), 10);

  let veredicto = "APTO";
  let recomendacion = "Cruce viable bajo control estándar.";

  if (riesgo >= 7) {
    veredicto = "APTO CON CONDICIONES";
    recomendacion = "Requiere pruebas genéticas y seguimiento veterinario.";
  }

  if (riesgo >= 9) {
    veredicto = "NO RECOMENDADO";
    recomendacion = "Alto riesgo hereditario. Cruce desaconsejado.";
  }

  return {
    veredicto,
    riesgoHereditario: riesgo,
    compatibilidadGenetica: compatibilidad,
    adecuacionObjetivo: adecuacion,
    recomendacion
  };
};
