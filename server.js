import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

import { evaluateCross } from "./rules/engine.js";
import { generateAIAnalysis } from "./rules/aiEngine.js"; // nuevo archivo IA

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// Middleware
// ======================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ======================
// Stripe
// ======================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ======================
// Estado simple (FREE)
// ⚠️ MVP: en memoria
// ======================
let usageCounter = {};

// ======================
// ANALYZE
// ======================
app.post("/analyze", async (req, res) => {
  try {
    const {
      breed,
      objective,
      consanguinity,
      antecedentes,
      userId = "anonymous",
      isPro = false
    } = req.body;

    // ----------------------
    // Control FREE
    // ----------------------
    if (!isPro) {
      if (!usageCounter[userId]) usageCounter[userId] = 0;

      if (usageCounter[userId] >= 3) {
        return res.status(403).json({
          error: "FREE_LIMIT_REACHED"
        });
      }

      usageCounter[userId]++;
    }

    // ----------------------
    // Motor determinista
    // ----------------------
    const baseResult = evaluateCross({
      breed,
      objective,
      consanguinity,
      antecedentes
    });

    // ----------------------
    // IA (solo texto)
    // ----------------------
    const aiText = await generateAIAnalysis({
      breed,
      objective,
      consanguinity,
      antecedentes,
      verdict: baseResult.verdict,
      score: baseResult.score
    });

    // ----------------------
    // Respuesta FINAL
    // (misma estructura que antes + mejor texto)
    // ----------------------
    res.json({
      verdict: baseResult.verdict,
      score: baseResult.score,
      explanation: aiText.explanation,
      recommendation: aiText.recommendation,
      remainingUses: isPro ? "∞" : Math.max(0, 3 - usageCounter[userId])
    });

  } catch (error) {
    console.error("ANALYZE ERROR:", error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ======================
// STRIPE CHECKOUT
// ======================
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: "BreedingAI PRO",
            description: "Análisis genético profesional ilimitado con IA"
          },
          unit_amount: 500,
          recurring: { interval: "month" }
        },
        quantity: 1
      }],
      success_url: process.env.FRONTEND_URL + "?pro=success",
      cancel_url: process.env.FRONTEND_URL + "?pro=cancel"
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("STRIPE ERROR:", error);
    res.status(500).json({ error: "STRIPE_ERROR" });
  }
});

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.send("BreedingAI backend OK");
});

// ======================
app.listen(PORT, () => {
  console.log(`BreedingAI backend running on port ${PORT}`);
});



