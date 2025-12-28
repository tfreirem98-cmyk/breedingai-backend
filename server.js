import express from "express";
import cors from "cors";

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== RUTA DE PRUEBA =====
app.get("/", (req, res) => {
  res.send("BreedingAI backend activo");
});

// ===== RUTA PRINCIPAL =====
app.post("/analyze", async (req, res) => {
  try {
    const { animal, breed, origin, goal } = req.body;

    // Respuesta simulada profesional
    const response = {
      classification: "APTO CON CONDICIONES",
      scores: {
        compatibility: 8,
        risk: 4,
        goal: 9
      },
      quickRecommendation:
        "El cruce es viable con un seguimiento cuidadoso de riesgos hereditarios moderados.",
      sections: [
        {
          title: "Evaluación genética",
          content:
            `La compatibilidad genética entre los ejemplares de ${breed} es alta, 
            con antecedentes favorables en líneas conocidas.`
        },
        {
          title: "Riesgos hereditarios",
          content:
            "Se detecta riesgo moderado de displasia y problemas oculares comunes en la raza."
        },
        {
          title: "Temperamento y comportamiento",
          content:
            "Se espera un temperamento equilibrado y sociable si se maneja adecuadamente la socialización."
        },
        {
          title: "Recomendaciones finales",
          content:
            "Se recomienda proceder con el cruce evitando repeticiones consecutivas y realizando controles veterinarios."
        }
      ]
    };

    res.json(response);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar el análisis" });
  }
});

// ===== PUERTO =====
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`BreedingAI backend escuchando en puerto ${PORT}`);
});


