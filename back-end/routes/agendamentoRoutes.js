const express = require("express");
const agendamentoController = require("../controllers/agendamentoController");
const auth = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

// Rotas públicas ou comuns
router.get("/horarios/:data", agendamentoController.horariosOcupados);
router.post("/criar", auth, agendamentoController.agendar);

// Rotas para cliente
router.get("/meus", auth, agendamentoController.meusAgendamentos);
router.delete("/cancelar/:id", auth, agendamentoController.cancelarAgendamento);

// Rotas administrativas
router.get("/admin/todos", auth, adminMiddleware, agendamentoController.listarTodosAgendamentos);
router.get("/admin/por-data/:data", auth, adminMiddleware, agendamentoController.listarAgendamentosPorData); // <-- ESSA LINHA

module.exports = router;