import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({
  origin: "*",
}));
app.use(express.json());

/* =========================
   CONTADOR DE USOS (DEMO)
========================= */
const usageStore = new Map();

/* =========================
   ANALYSIS ENGINE
========================= */
function generateAnalysis(data) {
  const { raza, objetivo, consanguinidad, antecedentes } = data;

  let score = 0;

  if (consanguinidad === "Alta") score += 4;
  if (consanguinidad === "Media") score += 2;
  if (consanguinidad === "Baja") score += 1;

  score += antecedentes.length;

  if (objetivo === "Trabajo") score += 1;
  if (objetivo === "Exposición") score += 2;

  if (score > 10) score = 10;

  let verdict = "RIESGO BAJO";
  if (score >= 4 && score <= 6) verdict = "RIESGO MODERADO";
  if (score >= 7) verdict = "RIESGO ALTO";

  const explanation = `
El análisis del cruce entre ejemplares de la raza <strong>${raza}</strong> indica un <strong>${verdict.toLowerCase()}</strong>.

Este resultado se obtiene al evaluar conjuntamente el objetivo de cría (<strong>${objetivo}</strong>), el nivel de consanguinidad (<strong>${consanguinidad}</strong>) y los antecedentes sanitarios conocidos.

Un nivel de consanguinidad <strong>${consanguinidad.toLowerCase()}</strong> incrementa la probabilidad de expresión de rasgos genéticos recesivos, especialmente cuando existen antecedentes coincidentes. En este contexto, la planificación genética es clave para preservar la salud y funcionalidad de la descendencia.
`;

  const recommendation = `
Se recomienda realizar <strong>test genéticos preventivos</strong>, evitar cruces repetidos dentro de la misma línea genética y establecer un seguimiento veterinario temprano.

Este cruce es viable, pero debe ejecutarse con criterios profesionales y una estrategia genética a medio y largo plazo.
`;

  return {
    verdict,
    score,
    explanation,
    recommendation
  };
}

/* =========================
   ANALYZE ENDPOINT
========================= */
app.post("/analyze", (req, res) => {
  const userId = req.ip;
  const isPro = req.headers["x-pro-user"] === "true";

  const used = usageStore.get(userId) || 0;

  if (!isPro && used >= 5) {
    return res.status(403).json({
      error: "Has alcanzado el límite de 5 análisis gratuitos.",
      showPro: true
    });
  }

  const analysis = generateAnalysis(req.body);

  if (!isPro) usageStore.set(userId, used + 1);

  res.json({
    ...analysis,
    remaining: isPro ? "∞" : Math.max(0, 5 - (used + 1)),
    pro: isPro
  });
});

/* =========================
   STRIPE CHECKOUT
========================= */
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
            description: "Análisis genético profesional ilimitado"
          },
          unit_amount: 500,
          recurring: { interval: "month" }
        },
        quantity: 1
      }],
      success_url: "https://breeding-ai-frontend-two.vercel.app/?pro=success",
      cancel_url: "https://breeding-ai-frontend-two.vercel.app/"
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("BreedingAI backend running on port 3000");
});

