module.exports = (req, res, next) => {
  const db = require("../db");
  db.query("SELECT is_admin FROM clientes WHERE id = ?", [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro interno" });
    if (results.length === 0 || !results[0].is_admin) {
      return res.status(403).json({ erro: "Acesso negado. Apenas administradores." });
    }
    next();
  });
};