const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();

/* ===============================
   CONFIG
================================ */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.json({ status: "BreedingAI backend OK" });
});

/* ===============================
   ANALYSIS ENDPOINT
================================ */
app.post("/analyze", (req, res) => {
  const { raza, objetivo, consanguinidad, antecedentes } = req.body;

  let score = 0;

  if (consanguinidad === "Alta") score += 3;
  if (consanguinidad === "Media") score += 2;
  if (consanguinidad === "Baja") score += 1;

  score += antecedentes.length;

  let verdict = "RIESGO BAJO";
  if (score >= 4) verdict = "RIESGO MODERADO";
  if (score >= 6) verdict = "RIESGO ALTO";

  res.json({
    verdict,
    score,
    explanation: `Evaluación basada en raza (${raza}), objetivo (${objetivo}), consanguinidad (${consanguinidad}) y antecedentes.`,
    recommendation:
      score >= 6
        ? "Cruce NO recomendado sin estudio genético avanzado."
        : score >= 4
        ? "Recomendado realizar test genético previo."
        : "Cruce aceptable con seguimiento básico."
  });
});

/* ===============================
   STRIPE – CHECKOUT
================================ */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
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
      success_url: "https://breedingai-frontend-two.vercel.app/success",
      cancel_url: "https://breedingai-frontend-two.vercel.app/cancel"
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe error" });
  }
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("BreedingAI backend running on port", PORT);
});
