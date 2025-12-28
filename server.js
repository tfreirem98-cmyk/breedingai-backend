import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("BreedingAI backend running");
});

// ================= ANALYZE =================
app.post("/api/analyze", async (req, res) => {
  try {
    const { animal, breed, origin, goal } = req.body;

    if (!animal || !breed || !goal) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const prompt = `
Actúa como un ESPECIALISTA EN CRÍA ANIMAL PROFESIONAL.

Tu tarea es asistir a un criador en la toma de decisiones.
NO uses lenguaje genérico ni ambiguo.
