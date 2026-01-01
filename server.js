import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const PORT = process.env.PORT || 3000;

// ==================
// CONFIGURACIÓN
// ==================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 5 usos gratis por IP (MVP estable)
const FREE_USES_LIMIT = 5;
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
// FUNCIÓN DE ANÁLISIS (DINÁMICA)
// ==================
function generarAnalisis({ raza, objetivo, consanguinidad, antecedentes }) {
  let puntuacion = 0;

  if (consanguinidad === "Media") puntuacion += 2;
  if (consanguinidad === "Alta") puntuacion += 4;

  puntuacion += antecedentes.length * 1.5;

  let veredicto = "RIESGO BAJO";
  if (puntuacion >= 4 && puntuacion < 7) veredicto = "RIESGO MODERADO";
  if (puntuacion >= 7) veredicto = "RIESGO ALTO";

  // TEXTO DINÁMICO REAL
  let descripcion = `El análisis del cruce para la raza ${raza}, con un objetivo de cría orientado a "${objetivo}", muestra un nivel de consanguinidad ${consanguinidad.toLowerCase()}.`;

  if (antecedentes.length > 0) {
    descripcion += ` Se han identificado antecedentes genéticos relevantes (${antecedentes.join(
      ", "
    )}), lo que incrementa el riesgo potencial de transmisión hereditaria.`;
  } else {
    descripcion +=
      " No se han reportado antecedentes genéticos relevantes, lo que reduce el riesgo global estimado.";
  }

  let recomendacion = "Cruce aceptable bajo seguimiento veterinario estándar.";

  if (veredicto === "RIESGO MODERADO") {
    recomendacion =
      "Se recomienda realizar pruebas genéticas preventivas y un seguimiento veterinario especializado antes del cruce.";
  }

  if (veredicto === "RIESGO ALTO") {
    recomendacion =
      "Cruce desaconsejado sin estudios genéticos exhaustivos y asesoramiento profesional especializado.";
  }

  return {
    veredicto,
    puntuacion: Math.round(puntuacion),
    descripcion,
    recomendacion
  };
}

// ==================
// ENDPOINT /analyze
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

  const { raza, objetivo, consanguinidad, antecedentes = [] } = req.body;

  const resultado = generarAnalisis({
    raza,
    objetivo,
    consanguinidad,
    antecedentes
  });

  res.json({
    usosRestantes: FREE_USES_LIMIT - (currentUses + 1),
    resultado
  });
});

// ==================
// STRIPE – PRO
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
                "Análisis profesionales ilimitados con informes avanzados"
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
