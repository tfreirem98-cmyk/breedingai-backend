import express from "express";
import cors from "cors";
import Stripe from "stripe";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors({ origin: "*" }));
app.use(express.json());

// =======================
// USOS GRATIS
// =======================
const FREE_LIMIT = 5;
const usageByIP = new Map();

// =======================
// ANALISIS BASE (ESTABLE)
// =======================
function generarAnalisisBase({ raza, objetivo, consanguinidad, antecedentes }) {
  let puntuacion = 0;

  if (consanguinidad === "Media") puntuacion += 2;
  if (consanguinidad === "Alta") puntuacion += 4;

  puntuacion += antecedentes.length * 1.5;

  let veredicto = "RIESGO BAJO";
  if (puntuacion >= 4 && puntuacion < 7) veredicto = "RIESGO MODERADO";
  if (puntuacion >= 7) veredicto = "RIESGO ALTO";

  return {
    veredicto,
    puntuacion: Math.round(puntuacion),
    descripcion: `Cruce evaluado para ${raza} con objetivo ${objetivo}.`,
    recomendacion:
      veredicto === "RIESGO ALTO"
        ? "Cruce desaconsejado sin pruebas genéticas."
        : "Cruce aceptable con seguimiento."
  };
}

// =======================
// FREE
// =======================
app.post("/analyze", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  const used = usageByIP.get(ip) || 0;

  if (used >= FREE_LIMIT) {
    return res.status(403).json({
      error: "FREE_LIMIT_REACHED",
      message: "Has alcanzado el límite de análisis gratuitos"
    });
  }

  usageByIP.set(ip, used + 1);

  const resultado = generarAnalisisBase(req.body);

  res.json({
    usosRestantes: FREE_LIMIT - (used + 1),
    resultado
  });
});

// =======================
// PRO (IA)
// =======================
app.post("/analyze-pro", async (req, res) => {
  const base = generarAnalisisBase(req.body);

  const prompt = `
Eres un veterinario especialista en genética canina.
Redacta un informe profesional basado en:

Raza: ${req.body.raza}
Objetivo: ${req.body.objetivo}
Consanguinidad: ${req.body.consanguinidad}
Antecedentes: ${
    req.body.antecedentes.length
      ? req.body.antecedentes.join(", ")
      : "Ninguno"
  }

Resultado:
- Veredicto: ${base.veredicto}
- Puntuación: ${base.puntuacion}

Informe claro, técnico y profesional.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4
  });

  res.json({
    resultadoBase: base,
    informeProfesional: completion.choices[0].message.content
  });
});

// =======================
// STRIPE
// =======================
app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: "BreedingAI PRO" },
          unit_amount: 500,
          recurring: { interval: "month" }
        },
        quantity: 1
      }
    ],
    success_url:
      "https://breeding-ai-frontend-two.vercel.app/?pro=success",
    cancel_url:
      "https://breeding-ai-frontend-two.vercel.app/"
  });

  res.json({ url: session.url });
});

app.listen(PORT, () => {
  console.log("BreedingAI backend OK");
});


