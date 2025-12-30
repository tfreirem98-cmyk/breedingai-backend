import express from "express";
import cors from "cors";
import Stripe from "stripe";
import OpenAI from "openai";
import { analyzeBase } from "./rules/engine.js";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (_, res) => res.json({ status: "BreedingAI backend OK" }));

/* ===== ANÁLISIS CON IA ===== */
app.post("/analyze", async (req, res) => {
  try {
    const base = analyzeBase(req.body);

    const prompt = `
Eres un veterinario genetista experto en cría canina profesional.
Redacta un informe claro, técnico y útil para criadores profesionales.

Datos:
Raza: ${req.body.breed}
Objetivo: ${req.body.goal}
Consanguinidad: ${req.body.inbreeding}
Antecedentes: ${req.body.issues.join(", ") || "Ninguno"}

Métricas:
Compatibilidad genética: ${base.genetic}/10
Riesgo hereditario: ${base.risk}/10
Adecuación al objetivo: ${base.suitability}/10

Conclusión esperada: ${base.verdict}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    res.json({
      ...base,
      report: completion.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

/* ===== STRIPE: CREAR SESIÓN ===== */
app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: req.body.priceId, quantity: 1 }],
    success_url: req.body.successUrl,
    cancel_url: req.body.cancelUrl
  });

  res.json({ url: session.url });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));


