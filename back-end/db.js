const mysql = require("mysql2");

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
  } else {
    console.log("MySQL conectado!");
  }
});

module.exports = connection;