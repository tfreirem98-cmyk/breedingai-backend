import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 👉 memoria simple de usos (MVP, luego DB)
const usageByIp = new Map();

// ---------- ANALYSIS ----------
app.post("/analyze", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const uses = usageByIp.get(ip) || 0;

  if (uses >= 5 && !req.body.isPro) {
    return res.status(403).json({ error: "FREE_LIMIT_REACHED" });
  }

  const { raza, objetivo, consanguinidad, antecedentes } = req.body;

  const prompt = `
Eres un genetista canino y asesor de criadores profesionales.
Analiza este cruce con lenguaje técnico y profesional.

Raza: ${raza}
Objetivo de cría: ${objetivo}
Consanguinidad: ${consanguinidad}
Antecedentes: ${antecedentes.join(", ") || "Ninguno"}

Incluye:
- Evaluación genética predictiva
- Riesgos estimados
- Recomendaciones técnicas concretas
- Uso profesional del resultado
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  usageByIp.set(ip, uses + 1);

  res.json({
    analysis: completion.choices[0].message.content,
    usesLeft: Math.max(0, 5 - (uses + 1))
  });
});

// ---------- STRIPE ----------
app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1
      }
    ],
    success_url: `${process.env.FRONTEND_URL}/app.html?pro=1`,
    cancel_url: `${process.env.FRONTEND_URL}/app.html`
  });

  res.json({ url: session.url });
});

app.listen(3000, () =>
  console.log("BreedingAI backend running on port 3000")
);

