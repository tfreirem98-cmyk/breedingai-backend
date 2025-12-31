require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const OpenAI = require("openai");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: "*" }));
app.use(express.json());

// =====================
// HEALTH
// =====================
app.get("/", (req, res) => {
  res.send("BreedingAI backend OK");
});

// =====================
// ANALYSIS WITH IA
// =====================
app.post("/analyze", async (req, res) => {
  try {
    const { raza, objetivo, consanguinidad, antecedentes } = req.body;

    const prompt = `
Eres un genetista canino especializado en asesorar criadores profesionales.
Analiza este cruce con rigor técnico, sin alarmismo ni simplificaciones.

Raza: ${raza}
Objetivo de cría: ${objetivo}
Consanguinidad: ${consanguinidad}
Antecedentes conocidos: ${antecedentes.length ? antecedentes.join(", ") : "Ninguno"}

Devuelve:
1. Veredicto global (RIESGO BAJO / MODERADO / ALTO)
2. Explicación técnica clara (3–5 frases)
3. Recomendación profesional concreta

Formato EXACTO:
VEREDICTO:
EXPLICACIÓN:
RECOMENDACIÓN:
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    const text = completion.choices[0].message.content;

    res.json({ analysis: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "IA_ERROR" });
  }
});

// =====================
// STRIPE (NO TOCAR)
// =====================
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
              name: "BreedingAI PRO"
            },
            unit_amount: 500,
            recurring: { interval: "month" }
          },
          quantity: 1
        }
      ],
      success_url: "https://breedingai.vercel.app/app.html?pro=1",
      cancel_url: "https://breedingai.vercel.app/app.html"
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe error" });
  }
});

// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("BreedingAI backend running on port", PORT);
});
