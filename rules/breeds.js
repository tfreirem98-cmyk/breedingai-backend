// rules/breeds.js
// Base profesional de razas caninas para análisis de cría
// Estructurada por riesgos, grupo funcional y observaciones reales de cría

export const BREEDS = {
  "Golden Retriever": {
    group: "trabajo",
    size: "grande",
    risks: {
      displasia: 3,
      respiratorios: 0,
      oculares: 2,
      neurologicos: 1
    },
    strengths: ["temperamento", "trabajo", "familia"],
    notes: "Raza muy utilizada en cría profesional. Controlar displasia y ojos."
  },

  "Labrador Retriever": {
    group: "trabajo",
    size: "grande",
    risks: {
      displasia: 3,
      respiratorios: 0,
      oculares: 1,
      neurologicos: 1
    },
    strengths: ["trabajo", "obediencia"],
    notes: "Alta demanda. Atención a obesidad y articulaciones."
  },

  "Pastor Alemán": {
    group: "trabajo",
    size: "grande",
    risks: {
      displasia: 4,
      respiratorios: 0,
      oculares: 1,
      neurologicos: 2
    },
    strengths: ["protección", "trabajo"],
    notes: "Evitar líneas extremas. Displasia crítica en cría."
  },

  "Border Collie": {
    group: "trabajo",
    size: "mediano",
    risks: {
      displasia: 1,
      respiratorios: 0,
      oculares: 2,
      neurologicos: 3
    },
    strengths: ["inteligencia", "trabajo"],
    notes: "Controlar epilepsia y estrés mental."
  },

  "Bulldog Francés": {
    group: "compañia",
    size: "pequeño",
    risks: {
      displasia: 2,
      respiratorios: 5,
      oculares: 3,
      neurologicos: 2
    },
    strengths: ["compañia"],
    notes: "Raza braquicéfala. Alto control sanitario obligatorio."
  },

  "Bulldog Inglés": {
    group: "compañia",
    size: "mediano",
    risks: {
      displasia: 3,
      respiratorios: 5,
      oculares: 3,
      neurologicos: 2
    },
    strengths: ["compañia"],
    notes: "Cría solo con control veterinario avanzado."
  },

  "Poodle": {
    group: "compañia",
    size: "variable",
    risks: {
      displasia: 1,
      respiratorios: 0,
      oculares: 2,
      neurologicos: 1
    },
    strengths: ["inteligencia", "compañia"],
    notes: "Raza versátil. Vigilar ojos y líneas nerviosas."
  },

  "Cocker Spaniel": {
    group: "compañia",
    size: "mediano",
    risks: {
      displasia: 1,
      respiratorios: 0,
      oculares: 4,
      neurologicos: 1
    },
    strengths: ["compañia"],
    notes: "Alta incidencia ocular. Selección genética clave."
  },

  "Chihuahua": {
    group: "compañia",
    size: "pequeño",
    risks: {
      displasia: 1,
      respiratorios: 1,
      oculares: 1,
      neurologicos: 3
    },
    strengths: ["compañia"],
    notes: "Atención a fontanelas y temperamento."
  },

  "Rottweiler": {
    group: "trabajo",
    size: "grande",
    risks: {
      displasia: 4,
      respiratorios: 0,
      oculares: 1,
      neurologicos: 2
    },
    strengths: ["protección", "trabajo"],
    notes: "Cría responsable imprescindible."
  },

  "Doberman": {
    group: "trabajo",
    size: "grande",
    risks: {
      displasia: 2,
      respiratorios: 0,
      oculares: 1,
      neurologicos: 4
    },
    strengths: ["protección"],
    notes: "Riesgo cardíaco y neurológico a vigilar."
  },

  "Boxer": {
    group: "trabajo",
    size: "mediano",
    risks: {
      displasia: 2,
      respiratorios: 3,
      oculares: 1,
      neurologicos: 2
    },
    strengths: ["compañia", "trabajo"],
    notes: "Braquicefalia moderada. Control cardíaco."
  },

  "Husky Siberiano": {
    group: "trabajo",
    size: "mediano",
    risks: {
      displasia: 1,
      respiratorios: 0,
      oculares: 3,
      neurologicos: 1
    },
    strengths: ["resistencia"],
    notes: "Control ocular y líneas hiperactivas."
  },

  "Mastín Español": {
    group: "trabajo",
    size: "gigante",
    risks: {
      displasia: 4,
      respiratorios: 1,
      oculares: 1,
      neurologicos: 1
    },
    strengths: ["protección"],
    notes: "Tamaño exige control estructural."
  },

  "Teckel": {
    group: "compañia",
    size: "pequeño",
    risks: {
      displasia: 2,
      respiratorios: 0,
      oculares: 1,
      neurologicos: 4
    },
    strengths: ["compañia"],
    notes: "Riesgo alto de problemas de columna."
  }
};
