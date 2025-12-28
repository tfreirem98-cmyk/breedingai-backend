import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json());

/* =======================
   STRIPE
======================= */
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY no definida");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* =======================
   HEALTH CHECK
======================= */
app.get("/", (req, res) => {
  res.send("BreedingAI backend activo");
});

/* =======================
   ANALYZE (SIMPLIFICADO)
======================= */
app.post("/analyze", (req, res) => {
  res.json({
    classification: "APTO CON CONDICIONES",
    summary: {
      shortDecision: "Cruce viable con control genético y sanitario"
    },
    scores: {
      geneticCompatibility: 8,
      hereditaryRisk: 3,
      goalAdequacy: 9
    },
    recommendations: {
      breedingAdvice: [
        "Evitar repetir este cruce en generaciones consecutivas"
      ]
    },
    finalDecision: {
      warning:
        "No recomendado para programas de cría intensivos sin control genético"
    }
  });
});

/* =======================
   STRIPE CHECKOUT
======================= */
app.post("/create-checkout-session", async (req, res) => {
  try {
    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error("STRIPE_PRICE_ID no definida");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL}/success.html`,
      cancel_url: `${process.env.FRONTEND_URL}/app.html`
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("❌ Error Stripe:", error.message);
    res.status(500).json({
      error: "Error al crear la sesión de pago",
      details: error.message
    });
  }
});

/* =======================
   SERVER
======================= */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ BreedingAI backend escuchando en puerto ${PORT}`);
});

