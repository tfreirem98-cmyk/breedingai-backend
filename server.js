import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();

/* =========================
   CONFIGURACIÓN
========================= */

// ⚠️ TU CLAVE SECRETA DE STRIPE (en Render como variable de entorno)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// FRONTEND PERMITIDO (Vercel)
const FRONTEND_URL = "https://breeding-ai-frontend-two.vercel.app";

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

/* =========================
   RUTAS
========================= */

app.get("/", (req, res) => {
  res.send("BreedingAI backend OK");
});

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
              name: "BreedingAI PRO",
              description:
                "Análisis avanzados con IA, uso ilimitado y recomendaciones profesionales",
            },
            recurring: { interval: "month" },
            unit_amount: 500, // 5€
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/success.html`,
      cancel_url: `${FRONTEND_URL}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Stripe error" });
  }
});

/* =========================
   SERVIDOR
========================= */

const PORT = process.env.PORT || 4242;
app.listen(PORT, () =>
  console.log(`🚀 BreedingAI backend running on port ${PORT}`)
);
