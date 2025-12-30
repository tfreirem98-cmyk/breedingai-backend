import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

/* ===============================
   BASE DE RAZAS (AMPLIA)
================================ */

const RAZAS = {
  "Golden Retriever": { trabajo: 7, salud: 7, riesgos: { displasia: 3, oculares: 3, respiratorios: 1, neurologicos: 1 }},
  "Labrador Retriever": { trabajo: 8, salud: 7, riesgos: { displasia: 3, oculares: 2, respiratorios: 1, neurologicos: 1 }},
  "Pastor Alemán": { trabajo: 9, salud: 6, riesgos: { displasia: 4, oculares: 2, respiratorios: 1, neurologicos: 2 }},
  "Bulldog Francés": { trabajo: 3, salud: 4, riesgos: { displasia: 2, oculares: 2, respiratorios: 5, neurologicos: 2 }},
  "Bulldog Inglés": { trabajo: 2, salud: 3, riesgos: { displasia: 3, oculares: 2, respiratorios: 5, neurologicos: 2 }},
  "Border Collie": { trabajo: 9, salud: 7, riesgos: { displasia: 2, oculares: 2, respiratorios: 1, neurologicos: 2 }},
  "Caniche": { trabajo: 6, salud: 8, riesgos: { displasia: 1, oculares: 2, respiratorios: 1, neurologicos: 1 }},
  "Rottweiler": { trabajo: 8, salud: 6, riesgos: { displasia: 4, oculares: 1, respiratorios: 1, neurologicos: 2 }},
  "Doberman": { trabajo: 8, salud: 6, riesgos: { displasia: 2, oculares: 1, respiratorios: 1, neurologicos: 3 }},
  "Chihuahua": { trabajo: 2, salud: 6, riesgos: { displasia: 1, oculares: 2, respiratorios: 2, neurologicos: 2 }},
  "Yorkshire Terrier": { trabajo: 3, salud: 6, riesgos: { displasia: 1, oculares: 2, respiratorios: 2, neurologicos: 1 }},
  "Beagle": { trabajo: 7, salud: 7, riesgos: { displasia: 2, oculares: 1, respiratorios: 1, neurologicos: 1 }},
  "Boxer": { trabajo: 7, salud: 6, riesgos: { displasia: 3, oculares: 2, respiratorios: 2, neurologicos: 2 }},
  "Husky Siberiano": { trabajo: 8, salud: 7, riesgos: { displasia: 3, oculares: 2, respiratorios: 1, neurologicos: 1 }},
  "Akita Inu": { trabajo: 7, salud: 6, riesgos: { displasia: 3, oculares: 2, respiratorios: 1, neurologicos: 2 }},
  "Shiba Inu": { trabajo: 6, salud: 7, riesgos: { displasia: 2, oculares: 2, respiratorios: 1, neurologicos: 1 }},
  "Cocker Spaniel": { trabajo: 6, salud: 6, riesgos: { displasia: 2, oculares: 3, respiratorios: 1, neurologicos: 1 }},
  "Dálmata": { trabajo: 7, salud: 6, riesgos: { displasia: 2, oculares: 1, respiratorios: 1, neurologicos: 2 }},
  "Mastín": { trabajo: 6, salud: 5, riesgos: { displasia: 4, oculares: 1, respiratorios: 2, neurologicos: 2 }}
};

/* ===============================
   MOTOR DE EVALUACIÓN
================================ */

function evaluarCruce({ raza, objetivo, consanguinidad, antecedentes }) {
  const base = RAZAS[raza];

  let riesgo = 0;
  let advertencias = [];

  if (!base) {
    return {
      estado: "NO EVALUABLE",
      compatibilidad: 0,
      riesgoHereditario: 0,
      adecuacionObjetivo: 0,
      recomendacion: "Raza no registrada en la base de datos.",
      advertencias: ["Raza no reconocida"]
    };
  }

  antecedentes.forEach(a => {
    riesgo += base.riesgos[a] || 0;
    advertencias.push(`Antecedente detectado: ${a}`);
  });

  if (consanguinidad === "Media") riesgo += 1;
  if (consanguinidad === "Alta") {
    riesgo += 3;
    advertencias.push("Consanguinidad alta incrementa el riesgo genético.");
  }

  let compatibilidad = Math.max(10 - riesgo, 2);
  let adecuacion =
    objetivo === "Trabajo" ? base.trabajo :
    objetivo === "Salud" ? base.salud : 6;

  let estado = "APTO";
  if (riesgo >= 7) estado = "NO RECOMENDADO";
  else if (riesgo >= 4) estado = "APTO CON CONDICIONES";

  return {
    estado,
    compatibilidad,
    riesgoHereditario: riesgo,
    adecuacionObjetivo: adecuacion,
    recomendacion:
      estado === "NO RECOMENDADO"
        ? "Cruce desaconsejado por alto riesgo genético."
        : estado === "APTO CON CONDICIONES"
        ? "Cruce viable solo con control genético y seguimiento veterinario."
        : "Cruce recomendable bajo criterios estándar.",
    advertencias
  };
}

/* ===============================
   ENDPOINT
================================ */

app.post("/analyze", (req, res) => {
  const { raza, objetivo, consanguinidad, antecedentes = [] } = req.body;

  const resultado = evaluarCruce({
    raza,
    objetivo,
    consanguinidad,
    antecedentes
  });

  res.json({ success: true, resultado });
});

app.get("/", (_, res) => res.send("BreedingAI backend activo"));

app.listen(PORT, () => {
  console.log("BreedingAI backend escuchando en", PORT);
});
