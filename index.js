// index.js
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Para poder leer JSON en el body
app.use(express.json());

// -----------------------------------------------------
// RUTA DE PRUEBA RAÍZ
// -----------------------------------------------------
app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "Backend Proyecto Autos funcionando" });
});

// -----------------------------------------------------
// RUTA /cotizar-auto (simulada por ahora)
// -----------------------------------------------------
app.post("/cotizar-auto", (req, res) => {
  console.log("Llego a /cotizar-auto con body:", req.body);

  // Simulación básica para probar que responde
  return res.json({
    origen: "SIMULADA",
    primaTotal: 320000,
    cuotaMensual: 26667,
    coberturas: [
      "Responsabilidad Civil",
      "Robo e Incendio Total",
      "Daño parcial por robo",
      "Cristales",
      "Granizo (tope simulado)"
    ],
    nota:
      "Cotización simulada desde /cotizar-auto. Una vez que SanCor esté estable, se reemplaza por la llamada real."
  });
});

// -----------------------------------------------------
// RUTA /cotizar-retiro
// -----------------------------------------------------
app.post("/cotizar-retiro", (req, res) => {
  const { edadActual, edadRetiro, aporteMensual, modo } = req.body;

  console.log("Llego a /cotizar-retiro con body:", req.body);

  // Validaciones
  if (
    typeof edadActual !== "number" ||
    typeof edadRetiro !== "number" ||
    typeof aporteMensual !== "number"
  ) {
    return res.status(400).json({
      error: "edadActual, edadRetiro y aporteMensual deben ser numéricos."
    });
  }

  if (edadRetiro <= edadActual) {
    return res.status(400).json({
      error: "La edad de retiro debe ser mayor que la edad actual."
    });
  }

  // Tasa interna (NO se muestra al usuario)
  const tasaConservadora = 0.159; // escenario prudente (oficial)
  const tasaRealista = 0.40;      // escenario potencial / realista

  const modoNormalizado =
    modo === "realista" || modo === "conservador" ? modo : "conservador";

  const tasaAnualUso =
    modoNormalizado === "realista" ? tasaRealista : tasaConservadora;

  const añosAporte = edadRetiro - edadActual;
  const mesesAporte = añosAporte * 12;

  const tasaMensual = Math.pow(1 + tasaAnualUso, 1 / 12) - 1;

  const capitalEstimado =
    aporteMensual * ((Math.pow(1 + tasaMensual, mesesAporte) - 1) / tasaMensual);

  return res.json({
    origen: "SIMULADA_RETIRO",
    modo: modoNormalizado,
    edadActual,
    edadRetiro,
    añosAporte,
    mesesAporte,
    aporteMensual,
    capitalEstimado: Math.round(capitalEstimado),
    nota:
      modoNormalizado === "realista"
        ? "Escenario potencial, más parecido a cómo se comportan hoy los rendimientos reales."
        : "Escenario conservador, similar al utilizado por el cotizador oficial."
  });
});

// -----------------------------------------------------
// LEVANTAR SERVIDOR
// -----------------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
