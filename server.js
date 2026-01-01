import express from "express";
import cors from "cors";
import Stripe from "stripe";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

// ==================
// CONFIGURACIÓN
// ==================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 5 usos gratis por IP
const FREE_USES_LIMIT = 3;
const usageByIP = new Map();

// ==================
// MIDDLEWARE
// ==================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());

// ==================
// HEALTH CHECK
// ==================
app.get("/", (req, res) => {
  res.send("BreedingAI backend OK");
});

// ==================
// FUNCIÓN ANÁLISIS BASE (FREE)
// ==================
function generarAnalisisBase({ raza, objetivo, consanguinidad, antecedentes }) {
  let puntuacion = 0;

  if (consanguinidad === "Media") puntuacion += 2;
  if (consanguinidad === "Alta") puntuacion += 4;

  puntuacion += antecedentes.length * 1.5;

  let veredicto = "RIESGO BAJO";
  if (puntuacion >= 4 && puntuacion < 7) veredicto = "RIESGO MODERADO";
  if (puntuacion >= 7) veredicto = "RIESGO ALTO";

  let descripcion = `El cruce propuesto para la raza ${raza} presenta un nivel de consanguinidad ${consanguinidad.toLowerCase()} y está orientado a un objetivo de cría enfocado en ${objetivo.toLowerCase()}.`;

  if (antecedentes.length > 0) {
    descripcion += ` Se han identificado antecedentes genéticos relevantes (${antecedentes.join(
      ", "
    )}), lo que incrementa el riesgo potencial en la descendencia.`;
  } else {
    descripcion +=
      " No se han identificado antecedentes genéticos relevantes en la línea evaluada.";
  }

  let recomendacion =
    "Cruce aceptable bajo seguimiento veterinario estándar.";

  if (veredicto === "RIESGO MODERADO") {
    recomendacion =
      "Se recomienda realizar pruebas genéticas preventivas antes de llevar a cabo el cruce.";
  }

  if (veredicto === "RIESGO ALTO") {
    recomendacion =
      "Cruce desaconsejado sin estudios genéticos exhaustivos y asesoramiento profesional.";
  }

  return {
    veredicto,
    puntuacion: Math.round(puntuacion),
    descripcion,
    recomendacion
  };
}

// ==================
// ENDPOINT FREE
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

  const resultado = generarAnalisisBase(req.body);

  res.json({
    usosRestantes: FREE_USES_LIMIT - (currentUses + 1),
    resultado
  });
});

// ==================
// ENDPOINT PRO (IA REAL)
// ==================
app.post("/analyze-pro", async (req, res) => {
  const { raza, objetivo, consanguinidad, antecedentes } = req.body;

  const base = generarAnalisisBase({
    raza,
    objetivo,
    consanguinidad,
    antecedentes
  });

  const prompt = `
Eres un veterinario especialista en genética canina y asesor de criadores profesionales.

Redacta un INFORME PROFESIONAL, claro y técnico, basado en los siguientes datos:

Raza: ${raza}
Objetivo de cría: ${objetivo}
Consanguinidad: ${consanguinidad}
Antecedentes genéticos: ${
    antecedentes.length > 0 ? antecedentes.join(", ") : "Ninguno conocido"
  }

Resultado base:
- Veredicto: ${base.veredicto}
- Puntuación: ${base.puntuacion}

El informe debe incluir:
1. Evaluación del riesgo genético
2. Impacto de la consanguinidad
3. Relevancia de los antecedentes
4. Adecuación al objetivo de cría
5. Recomendaciones profesionales claras

No menciones que eres una IA. Usa tono profesional.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    res.json({
      resultadoBase: base,
      informeProfesional: completion.choices[0].message.content
    });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "IA_ERROR" });
  }
});

// ==================
// STRIPE PRO
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
              description:
                "Informes profesionales con IA para criadores"
            },
            unit_amount: 500,
            recurring: { interval: "month" }
          },
          quantity: 1
        }
      ],
      success_url:
        "https://breeding-ai-frontend-two.vercel.app/?pro=success",
      cancel_url:
        "https://breeding-ai-frontend-two.vercel.app/?pro=cancel"
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


