const mysql = require("mysql2");

let connection;

if (process.env.MYSQL_HOST) {
  // Ambiente Railway: usa as variáveis fornecidas pelo serviço MySQL
  connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });
} else {
  // Ambiente local (desenvolvimento)
  connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "manicure_center"
  });
}

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao MySQL:", err);
    process.exit(1); // Encerra o processo se não conectar (ajuda a identificar erro)
  } else {
    console.log("MySQL conectado!");
  }
});

module.exports = connection;