require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ====== MIDDLEWARE ======
app.use(cors({
  origin: [
    "https://breedingai.vercel.app",
    "https://breedingai-frontend.vercel.app"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ====== HEALTH CHECK ======
app.get("/", (req, res) => {
  res.send("BreedingAI backend running");
});

// ====== STRIPE CHECKOUT ======
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 500, // 5 €
            recurring: { interval: "month" },
            product_data: {
              name: "BreedingAI PRO",
              description: "Análisis profesionales ilimitados"
            }
          },
          quantity: 1
        }
      ],
      success_url: "https://breedingai.vercel.app/success",
      cancel_url: "https://breedingai.vercel.app/cancel"
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ====== SERVER START ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

