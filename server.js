import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const PORT = process.env.PORT || 3000;

// ==================
// CONFIG
// ==================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 5 usos gratis por IP (simple y estable)
const FREE_USES_LIMIT = 5;
const usageByIP = new Map();

// ==================
// MIDDLEWARE
// ==================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ==================
// HEALTH CHECK
// ==================
app.get("/", (req, res) => {
  res.send("BreedingAI backend OK");
});

// ==================
// ANALYSIS ENDPOINT
// ==================
app.post("/analyze", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  const currentUses = usageByIP.get(ip) || 0;

  if (currentUses >= FREE_USES_LIMIT) {
    return res.status(403).json({
      error: "FREE_LIMIT_REACHED",
      message: "Has alcanzado el límite de análisis gratuitos"
    });
  }

  usageByIP.set(ip, currentUses + 1);

  const {
    raza,
    objetivo,
    consanguinidad,
    antecedentes = []
  } = req.body;

  // ====== LÓGICA ACTUAL (NO IA AÚN) ======
  let score = 0;

  if (consanguinidad === "Media") score += 2;
  if (consanguinidad === "Alta") score += 4;

  score += antecedentes.length;

  let riesgo = "BAJO";
  if (score >= 3 && score < 6) riesgo = "MODERADO";
  if (score >= 6) riesgo = "ALTO";

  let recomendacion = "Cruce aceptable con seguimiento básico.";
  if (riesgo === "MODERADO") {
    recomendacion = "Recomendado realizar test genético previo.";
  }
  if (riesgo === "ALTO") {
    recomendacion = "Cruce desaconsejado por alto riesgo genético.";
  }

  res.json({
    usosRestantes: FREE_USES_LIMIT - (currentUses + 1),
    resultado: {
      veredicto: `RIESGO ${riesgo}`,
      puntuacion: score,
      descripcion: `Evaluación basada en raza (${raza}), objetivo (${objetivo}), consanguinidad (${consanguinidad}) y antecedentes.`,
      recomendacion
    }
  });
});

// ==================
// STRIPE – PRO SUBSCRIPTION
// ==================
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
              description: "Análisis profesionales ilimitados con IA"
            },
            unit_amount: 500,
            recurring: {
              interval: "month"
            }
          },
          quantity: 1
        }
      ],
      success_url: "https://breeding-ai-frontend-two.vercel.app/?pro=success",
      cancel_url: "https://breeding-ai-frontend-two.vercel.app/?pro=cancel"
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "STRIPE_ERROR" });
  }
});

// ==================
// START SERVER
// ==================
app.listen(PORT, () => {
  console.log(`BreedingAI backend running on port ${PORT}`);
});

