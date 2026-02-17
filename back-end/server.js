require('dotenv').config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const agendamentoRoutes = require("./routes/agendamentoRoutes");

const app = express();

// 🔐 Lista de domínios permitidos
const allowedOrigins = [
  "https://manicure-center.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições como Postman ou apps mobile
    if (!origin) return callback(null, true);

    // Permite domínio principal
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Permite qualquer preview do Vercel do seu projeto
    if (origin.includes("enzofrangiotte-7296s-projects.vercel.app")) {
      return callback(null, true);
    }

    // Bloqueia qualquer outro domínio
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/agendamentos", agendamentoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
