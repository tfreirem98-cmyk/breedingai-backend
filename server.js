import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

/* ===== ANALYZE (YA LO TIENES FUNCIONANDO) ===== */
app.post("/analyze", (req, res) => {
  res.json({
    classification: "APTO CON CONDICIONES",
    scores: {
      geneticCompatibility: 8,
      hereditaryRisk: 3,
      goalAdequacy: 9
    },
    summary: {
      shortDecision: "Cruce viable con control genético y sanitario."
    },
    recommendations: {
      breedingAdvice: [
        "Evitar repetir este cruce en generaciones consecutivas."
      ]
    },
    finalDecision: {
      warning:
        "No recomendado para programas de cría intensivos sin control genético."
    }
  });
});

/* ===== STRIPE CHECKOUT ===== */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: "https://TU_FRONTEND_URL/success.html",
      cancel_url: "https://TU_FRONTEND_URL/app.html"
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`BreedingAI backend running on port ${PORT}`)
);


