import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// CONFIGURACIÓN
// ======================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ======================
// MIDDLEWARES
// ======================
app.use(
  cors({
    origin: [
      "https://breeding-ai-frontend-two.vercel.app",
      "http://localhost:5500",
    ],
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.json({ status: "BreedingAI backend online" });
});

// ======================
// ANÁLISIS (LÓGICA + IA SIMULADA)
// ======================
app.post("/analyze", (req, res) => {
  const { breed, goal, consanguinity, antecedentes } = req.body;

  let score = 0;

  if (consanguinity === "Alta") score += 4;
  if (consanguinity === "Media") score += 2;
  if (goal === "Trabajo") score += 1;

  if (antecedentes?.includes("Displasia")) score += 2;
  if (antecedentes?.includes("Oculares")) score += 1;
  if (antecedentes?.includes("Neurológicos")) score += 3;

  let verdict = "RIESGO BAJO";
  if (score >= 4) verdict = "RIESGO MODERADO";
  if (score >= 7) verdict = "RIESGO ALTO";

  res.json({
    verdict,
    score,
    explanation: `Evaluación basada en raza (${breed}), objetivo (${goal}), consanguinidad (${consanguinity}) y antecedentes.`,
    recommendation:
      verdict === "RIESGO ALTO"
        ? "NO recomendado. Riesgo genético elevado."
        : verdict === "RIESGO MODERADO"
        ? "Recomendado solo con test genético completo."
        : "Cruce aceptable con seguimiento básico.",
  });
});

// ======================
// STRIPE – PLAN PRO
// ======================
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_PRO,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/app.html?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/app.html?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Stripe error" });
  }
});

// ======================
app.listen(PORT, () => {
  console.log(`BreedingAI backend running on port ${PORT}`);
});

