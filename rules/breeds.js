/**
 * Base de conocimiento por raza
 * Este archivo define riesgos y sensibilidades genéticas conocidas
 * NO es IA, es conocimiento estructurado
 */

export const BREEDS = {
  "Border Collie": {
    riskLevel: "medio",
    commonIssues: ["Oculares", "Neurológicos"],
    workSensitive: true,
    notes:
      "Raza de trabajo con alta sensibilidad neurológica y ocular. Requiere especial atención en líneas de alto rendimiento."
  },

  "Golden Retriever": {
    riskLevel: "medio",
    commonIssues: ["Displasia", "Oculares"],
    workSensitive: false,
    notes:
      "Predisposición a displasia de cadera y problemas oculares. Alta incidencia de enfermedades hereditarias en líneas no controladas."
  },

  "Labrador Retriever": {
    riskLevel: "medio",
    commonIssues: ["Displasia", "Oculares"],
    workSensitive: false,
    notes:
      "Raza robusta pero con alta prevalencia de displasia y problemas articulares en cruces no planificados."
  },

  "Pastor Alemán": {
    riskLevel: "alto",
    commonIssues: ["Displasia", "Neurológicos"],
    workSensitive: true,
    notes:
      "Alta predisposición genética a displasia y problemas neurológicos. La consanguinidad debe controlarse estrictamente."
  },

  "Bulldog Francés": {
    riskLevel: "alto",
    commonIssues: ["Respiratorios", "Oculares"],
    workSensitive: false,
    notes:
      "Raza braquicéfala con problemas respiratorios frecuentes. Se recomienda extrema cautela en selección genética."
  },

  "Bulldog Inglés": {
    riskLevel: "alto",
    commonIssues: ["Respiratorios", "Oculares"],
    workSensitive: false,
    notes:
      "Riesgo elevado de problemas respiratorios y reproductivos. Cruces deben planificarse con criterios de salud estrictos."
  },

  "Caniche": {
    riskLevel: "bajo",
    commonIssues: ["Oculares"],
    workSensitive: false,
    notes:
      "Raza generalmente saludable, aunque con predisposición a problemas oculares hereditarios."
  },

  "Rottweiler": {
    riskLevel: "medio",
    commonIssues: ["Displasia"],
    workSensitive: true,
    notes:
      "Raza potente con predisposición a displasia. La selección estructural es clave para preservar funcionalidad."
  },

  "Doberman": {
    riskLevel: "alto",
    commonIssues: ["Neurológicos", "Cardíacos"],
    workSensitive: true,
    notes:
      "Alta incidencia de miocardiopatía dilatada y problemas neurológicos. Se recomienda control genético riguroso."
  }
};
