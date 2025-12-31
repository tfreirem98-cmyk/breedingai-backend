require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ===== CONFIG =====
app.use(express.json());

app.use(
  cors({
    origin: [
      "https://breedingai-frontend-two.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
  })
);

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("BreedingAI backend OK");
});

// ===== ANALYSIS ENDPOINT =====
app.post("/analyze", (req, res) => {
  const { raza, objetivo, consanguinidad, antecedentes } = req.body;

  let score = 0;

  // Consanguinidad
  if (consanguinidad === "Alta") score += 4;
  if (consanguinidad === "Media") score += 2;

  // Antecedentes
  score += antecedentes.length;

  // Razas sensibles
  if (
    ["Bulldog Inglés", "Pug", "French Bulldog"].includes(raza)
  ) {
    score += 2;
  }

  let veredicto = "RIESGO BAJO";
  let recomendacion = "Cruce aceptable con seguimiento básico.";

  if (score >= 5) {
    veredicto = "RIESGO MODERADO";
    recomendacion =
      "Se recomienda test genético y reducir consanguinidad.";
  }

  if (score >= 8) {
    veredicto = "RIESGO ALTO";
    recomendacion =
      "Cruce no recomendado sin asesoramiento genético profesional.";
  }

  res.json({
    veredicto,
    puntuacion: score,
    descripcion: `Evaluación basada en raza (${raza}), objetivo (${objetivo}), consanguinidad (${consanguinidad}) y antecedentes.`,
    recomendacion,
  });
});

// ===== STRIPE PRO =====
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
      cancel_url: `${process.env.FRONTEND_URL}/`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe error" });
  }
});

// ===== SERVER =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`BreedingAI backend running on port ${PORT}`);
});
