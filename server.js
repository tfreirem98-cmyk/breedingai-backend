import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("BreedingAI backend OK");
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { father, mother, notes } = req.body;

    const prompt = `
Eres un experto en cría animal.

Datos del padre:
Animal: ${father.animal}
Raza: ${father.breed}
Origen: ${father.origin}

Datos de la madre:
Animal: ${mother.animal}
Raza: ${mother.breed}
Origen: ${mother.origin}

Objetivo del criador:
${notes.goal}

Nivel de detalle solicitado:
${notes.detail}

Genera un análisis ${
      notes.detail === "informe"
        ? "completo y profesional"
        : "claro y accionable"
    } para un criador profesional.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.send(completion.choices[0].message.content);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del análisis");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("BreedingAI backend running on port", PORT);
});
