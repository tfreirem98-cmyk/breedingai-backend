const express = require("express");
const cors = require("cors");

const app = express();

// CORS — MUY IMPORTANTE
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ status: "BreedingAI backend OK" });
});

// RUTA ANALYZE (la que usa el frontend)
app.post("/analyze", (req, res) => {
  const { breed, goal, inbreeding, conditions } = req.body;

  if (!breed || !goal || !inbreeding) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  // Resultado MOCK estable (luego se conecta IA)
  const result = {
    status: "APTO",
    compatibility: 9,
    hereditaryRisk: conditions?.length ? 4 : 1,
    suitability: goal === "Salud" ? 8 : 6,
    message: "Cruce recomendable bajo criterios profesionales.",
  };

  res.json(result);
});

// PUERTO (Render lo necesita así)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

