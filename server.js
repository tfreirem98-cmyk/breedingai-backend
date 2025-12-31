require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const OpenAI = require("openai");

const app = express();

// ---------- MIDDLEWARE ----------
app.use(cors({ origin: "*" }));
app.use(express.json());

// ---------- STRIPE ----------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------- OPENAI ----------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ---------- HEALTH ----------
app.get("/", (req, res) => {
  res.send("BreedingAI backend OK");
});

// ---------- ANALYSIS (IA REAL) ----------
app.post("/analyze", async (req, res) => {
  try {
    const { raza, objetivo, consanguinidad, antecedentes } = req.body;

    const prompt = `
Eres un genetista canino profesional especializado en asesorar criadores.

Analiza este cruce de forma técnica y clara:

Raza: ${raza}
Objetivo de cría: ${objetivo}
Consanguinidad: ${consanguinidad}
Antecedentes: ${antecedentes.length ? antecedentes.join(", ") : "Ninguno"}

Devuelve EXACTAMENTE este formato:

VEREDICTO:
EXPLICACIÓN:
RECOMENDACIÓN:
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    res.json({
      analysis: completion.choices[0].message.content
    });
  } catch (err) {
    console.error("IA ERROR:", err);
    res.status(500).json({ error: "IA_ERROR" });
  }
});

// ---------- STRIPE CHECKOUT ----------
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
    console.error("STRIPE ERROR:", err);
    res.status(500).json({ error: "STRIPE_ERROR" });
  }
});

// ---------- START ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("BreedingAI backend running on port", PORT);
});
