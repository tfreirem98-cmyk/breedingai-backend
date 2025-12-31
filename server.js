require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
const PORT = process.env.PORT || 3000;

// Stripe (solo se usará cuando el botón PRO funcione)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Health check (MUY IMPORTANTE para Render)
app.get("/", (req, res) => {
  res.send("BreedingAI backend OK");
});

// =====================
// ANALYSIS ENDPOINT
// =====================
app.post("/analyze", (req, res) => {
  const { raza, objetivo, consanguinidad, antecedentes } = req.body;

  let score = 0;

  if (consanguinidad === "Alta") score += 3;
  if (consanguinidad === "Media") score += 2;
  if (consanguinidad === "Baja") score += 1;

  if (Array.isArray(antecedentes)) {
    score += antecedentes.length;
  }

  let verdict = "RIESGO BAJO";
  if (score >= 3) verdict = "RIESGO MODERADO";
  if (score >= 6) verdict = "RIESGO ALTO";

  res.json({
    verdict,
    score,
    explanation: `Evaluación basada en raza (${raza}), objetivo (${objetivo}), consanguinidad (${consanguinidad}) y antecedentes.`,
    recommendation:
      verdict === "RIESGO BAJO"
        ? "Cruce aceptable con seguimiento básico."
        : verdict === "RIESGO MODERADO"
        ? "Recomendable control veterinario y pruebas genéticas."
        : "Cruce no recomendado sin intervención profesional."
  });
});

// =====================
// STRIPE – PRO (AÚN NO CONECTADO EN FRONT)
// =====================
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "BreedingAI PRO"
            },
            unit_amount: 2900,
            recurring: { interval: "month" }
          },
          quantity: 1
        }
      ],
      success_url: "https://tu-frontend.vercel.app/success",
      cancel_url: "https://tu-frontend.vercel.app/cancel"
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe error" });
  }
});

// =====================
app.listen(PORT, () => {
  console.log(`🚀 BreedingAI backend running on port ${PORT}`);
});
