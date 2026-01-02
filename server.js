import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import { runAnalysis } from "./rules/engine.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({
  origin: "*"
}));

app.use(express.json());

/* ----------- ANALYSIS ENDPOINT ----------- */

app.post("/analyze", async (req, res) => {
  try {
    const { breed, objective, consanguinity, antecedentes } = req.body;

    if (!breed || !objective || !consanguinity) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const analysis = await runAnalysis({
      breed,
      objective,
      consanguinity,
      antecedentes: antecedentes || []
    });

    res.json({ analysis });

  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ error: "Error generando el análisis" });
  }
});

/* ----------- STRIPE CHECKOUT ----------- */

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
            recurring: {
              interval: "month"
            }
          },
          quantity: 1
        }
      ],
      success_url: process.env.FRONTEND_URL + "?success=true",
      cancel_url: process.env.FRONTEND_URL + "?cancelled=true"
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Error en Stripe" });
  }
});

/* ----------- HEALTH CHECK ----------- */

app.get("/", (req, res) => {
  res.send("BreedingAI backend running");
});

app.listen(PORT, () => {
  console.log(`BreedingAI backend listening on port ${PORT}`);
});


