require('dotenv').config(); // <-- adicione esta linha
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const agendamentoRoutes = require("./routes/agendamentoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/agendamentos", agendamentoRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});