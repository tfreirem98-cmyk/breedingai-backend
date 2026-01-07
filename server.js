import express from "express";
import cors from "cors";
import { analyze } from "./rules/engine.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  try {
    const result = await analyze(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error en análisis:", err.message);
    res.status(500).json({ error: "Error en análisis clínico" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("BreedingAI backend activo en puerto", PORT);
});


