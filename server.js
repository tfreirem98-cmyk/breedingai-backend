import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// CONFIG
// ======================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ======================
// MIDDLEWARE
// ======================
app.use(cors({ origin: "*" }));
app.use(express.json());

// ======================
// HEALTH
// ======================
app.get("/", (req, res) => {
  res.json({ status: "BreedingAI backend online" });
});

// ======================
// ANALYSIS (FREE vs PRO)
// ======================
app.post("/analyze", (req, res) => {
  const { breed, goal, consanguinity, antecedentes, pro } = req.body;

  let score = 2;

  if (consanguinity === "Media") score += 2;
  if (consanguinity === "Alta") score += 4;
  if (antecedentes && antecedentes.length > 0) {
    score += antecedentes.length * 2;
  }

  let verdict = "RIESGO BAJO";
  if (score >= 5) verdict = "RIESGO MODERADO";
  if (score >= 8) verdict = "RIESGO ALTO";

  const base = {
    verdict,
    score,
  };

  // ===== FREE =====
  if (!pro) {
    return res.json({
      ...base,
      summary:
        "Resumen básico del análisis. Desbloquea el informe PRO para ver el análisis completo y recomendaciones profesionales.",
      locked: true,
    });
  }

  // ===== PRO =====
  return res.json({
    ...base,
    summary: `Evaluación completa del cruce para la raza ${breed}, teniendo en cuenta el objetivo (${goal}), la consanguinidad (${consanguinity}) y los antecedentes clínicos.`,
    recommendation:
      verdict === "RIESGO ALTO"
        ? "Cruce no recomendado sin pruebas genéticas exhaustivas y asesoramiento veterinario especializado."
        : verdict === "RIESGO MODERADO"
        ? "Recomendado solo con test genético previo y seguimiento sanitario."
        : "Cruce compatible con controles sanitarios estándar.",
    locked: false,
  });
});

// ======================
// STRIPE CHECKOUT PRO
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
      success_url: `${process.env.FRONTEND_URL}/app.html?pro=true`,
      cancel_url: `${process.env.FRONTEND_URL}/app.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Stripe error" });
  }
});

// ======================
app.listen(PORT, () => {
  console.log("BreedingAI backend running on port", PORT);
});
