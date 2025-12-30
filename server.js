const express = require("express");
const cors = require("cors");
const analyze = require("./rules/engine");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.post("/analyze", (req, res) => {
  try {
    const { breed, goal, consanguinity, antecedentes } = req.body;

    if (!breed || !goal || !consanguinity || !Array.isArray(antecedentes)) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const result = analyze({ breed, goal, consanguinity, antecedentes });
    res.json(result);

  } catch (e) {
    res.status(500).json({ error: "Error interno" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend activo en puerto", PORT));


