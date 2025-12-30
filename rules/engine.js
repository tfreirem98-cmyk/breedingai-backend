const breeds = require("./breeds");

function analyzeCross(data) {
  const breed = breeds[data.breed];
  if (!breed) throw new Error("Unknown breed");

  let genetic = 10 - data.consanguinity * 3;
  let risk = breed.baseRisk + data.conditions.length * 2;
  let goalScore = data.goal === "Salud" ? 8 : 6;

  return {
    status: risk <= 5 ? "APTO" : "APTO CON CONDICIONES",
    genetic,
    risk,
    goalScore,
    explanation: `Cruce evaluado para ${data.breed}. Riesgo ${risk}/10.`
  };
}

module.exports = { analyzeCross };
