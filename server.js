import express from "express";
import cors from "cors";

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));
app.use(express.json());

/* =======================
   HEALTH CHECK (IMPORTANTE)
======================= */
app.get("/", (req, res) => {
  res.send("BreedingAI backend OK");
});

/* =======================
   ANALYSIS ENDPOINT
======================= */
app.post("/analyze", (req, res) => {
  const { breed, objective, consanguinity, antecedentes } = req.body;

  if (!breed || !objective || !consanguinity) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  let riesgo = 2;
  if (consanguinity === "Media") riesgo += 2;
  if (consanguinity === "Alta") riesgo += 4;
  riesgo += antecedentes.length;

  const compatibilidad = Math.max(10 - riesgo, 1);
  const adecuacion =
    objective === "Salud" ? 8 :
    objective === "Trabajo" ? 7 : 6;

  let clasificacion = "APTO";
  if (riesgo >= 6) clasificacion = "APTO CON CONDICIONES";
  if (riesgo >= 8) clasificacion = "NO RECOMENDADO";

  res.json({
    clasificacion,
    compatibilidadGenetica: compatibilidad,
    riesgoHereditario: riesgo,
    adecuacionObjetivo: adecuacion,
    recomendacion:
      clasificacion === "APTO"
        ? "Cruce recomendado bajo criterios estándar."
        : clasificacion === "APTO CON CONDICIONES"
        ? "Cruce viable con control genético y seguimiento veterinario."
        : "Cruce no recomendado por alto riesgo hereditario."
  });
});

/* =======================
   SERVER START (CLAVE)
======================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`BreedingAI backend escuchando en puerto ${PORT}`);
});



