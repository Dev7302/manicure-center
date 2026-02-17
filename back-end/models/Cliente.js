const db = require("../db");

module.exports = {
  criar: (nome, email, telefone, senha, callback) => {
    db.query(
      "INSERT INTO clientes (nome, email, telefone, senha) VALUES (?, ?, ?, ?)",
      [nome, email, telefone, senha],
      callback
    );
  },

  buscarPorEmail: (email, callback) => {
    db.query(
      "SELECT id, nome, email, telefone, senha, is_admin FROM clientes WHERE email = ?",
      [email],
      callback
    );
  },

  buscarPorId: (id, callback) => {
    db.query("SELECT id, nome, email, telefone, is_admin FROM clientes WHERE id = ?", [id], callback);
  }
};