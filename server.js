import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// ================= CONFIG =================
app.use(cors());
app.use(express.json());

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("BreedingAI backend is running");
});

// ================= ANALYZE ROUTE =================
app.post("/api/analyze", async (req, res) => {
  try {
    const { animal, breed, origin, goal } = req.body;

    if (!animal || !breed || !goal) {
      return res.status(400).json({
        error: "Faltan datos obligatorios",
      });
    }

    const prompt = `
Eres un especialista en cría animal profesional.

Analiza el siguiente cruce y proporciona un informe claro y estructurado.

Animal: ${animal}
Raza: ${breed}
Origen genético: ${origin || "No especificado"}
Objetivo de la cría: ${goal}

Devuelve:
- Compatibilidad genética (Alta / Media / Baja)
- Riesgos hereditarios
- Recomendación principal
- Observación práctica
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un experto en genética y cría animal.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({
        error: "Error al generar el análisis",
      });
    }

    const analysis = data.choices[0].message.content;

    res.json({ analysis });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`BreedingAI backend running on port ${PORT}`);
});
