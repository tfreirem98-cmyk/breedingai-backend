export function analyzeBase(data) {
  let risk = data.issues.length * 2;
  if (data.inbreeding === "Media") risk += 3;
  if (data.inbreeding === "Alta") risk += 6;

  const genetic = Math.max(1, 10 - risk);
  const suitability = Math.min(10, 6 + (data.goal !== "Salud" ? 2 : 0));

  let verdict = "APTO";
  if (risk >= 6) verdict = "APTO CON CONDICIONES";
  if (risk >= 8) verdict = "NO RECOMENDADO";

  return { genetic, risk, suitability, verdict };
}
