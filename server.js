// server.js

import express from "express";
import cors from "cors";
import { analyze } from "./rules/engine.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/analyze", (req, res) => {
  try {
    const result = analyze(req.body);
    res.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(400).json({ error: "Invalid analysis input" });
  }
});

app.get("/", (req, res) => {
  res.send("BreedingAI backend running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
;
