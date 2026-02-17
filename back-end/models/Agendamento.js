const db = require("../db");

module.exports = {
criar: (clienteId, servico, data, hora, grupoId, callback) => {
  db.query(
    "INSERT INTO agendamentos (cliente_id, servico, data, hora, grupo_id) VALUES (?, ?, ?, ?, ?)",
    [clienteId, servico, data, hora, grupoId],
    callback
  );
},

  listarPorDia: (data, callback) => {
    db.query(
      "SELECT hora FROM agendamentos WHERE data = ?",
      [data],
      callback
    );
  }
  
};