require('dotenv').config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const agendamentoRoutes = require("./routes/agendamentoRoutes");
const app = express();

// Configuração CORS explícita para aceitar seu front-end
app.use(cors({
    origin: [
        'https://manicure-center-onik.vercel.app',
        'https://manicure-center-onik-2z1st89np-enzofrangiotte-7296s-projects.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Alternativa para teste (permitir todas as origens)
// app.use(cors({ origin: '*' }));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/agendamentos", agendamentoRoutes);

// Use a porta fornecida pelo Railway (importante!)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
app.get('/', (req, res) => {
  res.send('Servidor online');
});