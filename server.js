import express from "express";
import cors from "cors";
import { analyze } from "./rules/engine.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ===============================
// Endpoint principal de análisis
// ===============================
app.post("/analyze", async (req, res) => {
  try {
    const {
      raza,
      objetivo,
      consanguinidad,
      antecedentes
    } = req.body;

    // Validación básica (nunca romper)
    if (!raza || !objetivo || !consanguinidad) {
      return res.json({
        veredicto_clinico: "NO DISPONIBLE",
        indice_riesgo: "-",
        resumen_ejecutivo:
          "Datos insuficientes para realizar el análisis clínico.",
        perfil_genetico_raza: "",
        impacto_consanguinidad: "",
        evaluacion_antecedentes: "",
        escenarios_descendencia: {},
        recomendacion_clinica_final:
          "Revisa los datos introducidos e inténtalo de nuevo.",
        checklist_veterinario: []
      });
    }

    // Llamada a la IA razonadora clínica
    const result = await analyze({
      raza,
      objetivo,
      consanguinidad,
      antecedentes: antecedentes || []
    });

    // Respuesta alineada con frontend premium
    return res.json(result);

  } catch (error) {
    console.error("Error en /analyze:", error.message);

    // ⚠️ Nunca devolvemos 500 sin cuerpo
    return res.json({
      veredicto_clinico: "NO DISPONIBLE",
      indice_riesgo: "-",
      resumen_ejecutivo:
        "No se pudo generar el informe clínico en este momento.",
      perfil_genetico_raza: "",
      impacto_consanguinidad: "",
      evaluacion_antecedentes: "",
      escenarios_descendencia: {},
      recomendacion_clinica_final:
        "Inténtalo de nuevo más tarde o consulta con un veterinario especializado.",
      checklist_veterinario: []
    });
  }
});

// ===============================
// Health check
// ===============================
app.get("/", (_, res) => {
  res.send("BreedingAI backend operativo");
});

// ===============================
// Arranque servidor
// ===============================
app.listen(PORT, () => {
  console.log(`BreedingAI backend escuchando en puerto ${PORT}`);
});


