const express = require("express");
const cors = require("cors");

const app = express();

/* ---------- CORS ---------- */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.options("*", cors());

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());

/* ---------- HEALTH CHECK ---------- */
app.get("/", (req, res) => {
  res.json({ status: "BreedingAI backend OK" });
});

/* ---------- ANALYZE ENDPOINT ---------- */
app.post("/analyze", (req, res) => {
  const { breed, goal, inbreeding, conditions } = req.body;

  if (!breed || !goal || !inbreeding) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const riskScore = conditions.length * 2 + (inbreeding === "Alta" ? 5 : 1);

  const verdict = riskScore <= 4
    ? "APTO"
    : riskScore <= 7
    ? "RIESGO MODERADO"
    : "NO RECOMENDADO";

  res.json({
    verdict,
    compatibility: Math.max(1, 10 - riskScore),
    hereditaryRisk: riskScore,
    goalMatch: goal === "Salud" ? 9 : 7,
    explanation: `El cruce presenta un nivel de riesgo ${verdict.toLowerCase()} según los parámetros introducidos.`
  });
});

/* ---------- START ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("BreedingAI backend running on port", PORT);
});

