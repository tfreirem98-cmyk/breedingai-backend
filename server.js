import express from "express";
import cors from "cors";
import { analyzeCross } from "./rules/engine.js";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("BreedingAI backend OK");
});

app.post("/analyze", (req, res) => {
  try {
    const result = analyzeCross(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Analysis failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});


