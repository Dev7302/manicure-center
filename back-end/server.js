console.log('🚀 1. Iniciando server.js');
require('dotenv').config();
console.log('✅ 2. dotenv carregado');

const express = require("express");
console.log('✅ 3. express carregado');

const cors = require("cors");
console.log('✅ 4. cors carregado');

const authRoutes = require("./routes/authRoutes");
console.log('✅ 5. authRoutes carregado');

const agendamentoRoutes = require("./routes/agendamentoRoutes");
console.log('✅ 6. agendamentoRoutes carregado');

const app = express();
console.log('✅ 7. app criado');

// 🔐 Lista de domínios permitidos
const allowedOrigins = [
  "https://manicure-center.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (origin.includes("enzofrangiotte-7296s-projects.vercel.app")) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
console.log('✅ 8. CORS configurado');

app.use(express.json());
console.log('✅ 9. express.json configurado');

app.use("/api/auth", authRoutes);
app.use("/api/agendamentos", agendamentoRoutes);
console.log('✅ 10. Rotas montadas');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 11. Servidor rodando na porta ${PORT}`);
});