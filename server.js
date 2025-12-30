import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();

/* =====================
   CONFIG
===================== */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* =====================
   MIDDLEWARE
===================== */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* =====================
   HEALTH CHECK
===================== */
app.get("/", (req, res) => {
  res.json({ status: "BreedingAI backend online" });
});

/* =====================
   ANALYZE (LO QUE YA FUNCIONA)
===================== */
app.post("/analyze", (req, res) => {
  const { breed, goal, inbreeding, conditions } = req.body;

  let riskScore = 3;
  if (inbreeding === "Media") riskScore += 2;
  if (inbreeding === "Alta") riskScore += 4;
  if (conditions && conditions.length > 0) riskScore += conditions.length * 2;

  let verdict = "APTO";
  if (riskScore >= 8) verdict = "NO RECOMENDADO";
  else if (riskScore >= 5) verdict = "RIESGO MODERADO";

  res.json({
    verdict,
    riskScore,
    explanation:
      "Evaluación basada en raza, consanguinidad y antecedentes clínicos.",
    recommendations:
      verdict === "APTO"
        ? "Cruce compatible con controles sanitarios estándar."
        : verdict === "RIESGO MODERADO"
        ? "Se recomienda test genético y reducción de consanguinidad."
        : "Cruce no recomendado sin pruebas genéticas exhaustivas.",
  });
});

/* =====================
   STRIPE CHECKOUT
===================== */
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
    console.error(error);
    res.status(500).json({ error: "Stripe error" });
  }
});

/* =====================
   START SERVER
===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("BreedingAI backend running on port", PORT);
});
