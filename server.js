app.post("/analyze", async (req, res) => {
  try {
    const { raza, objetivo, consanguinidad, antecedentes } = req.body;

    if (!raza || !objetivo || !consanguinidad || !antecedentes) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // 🔑 CONVERSIÓN CLAVE: objeto → array
    const antecedentesArray = Object.entries(antecedentes)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    const result = await runAnalysis({
      raza,
      objetivo,
      consanguinidad,
      antecedentes: antecedentesArray
    });

    res.json(result);
  } catch (err) {
    console.error("Error en análisis:", err);
    res.status(500).json({ error: "Error interno de análisis" });
  }
});

