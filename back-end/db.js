const mysql = require("mysql2");

// Usa a variável de ambiente DATABASE_URL se existir, senão usa a configuração local
const connection = mysql.createConnection(
  process.env.DATABASE_URL || {
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "manicure_center"
  }
);

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao MySQL:", err);
    process.exit(1); // encerra o processo se não conectar (ajuda a identificar erro)
  } else {
    console.log("MySQL conectado!");
  }
});

module.exports = connection;