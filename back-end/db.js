const mysql = require("mysql2");

console.log("🔍 Variáveis de ambiente do MySQL:");
console.log("MYSQL_HOST:", process.env.MYSQL_HOST);
console.log("MYSQL_PORT:", process.env.MYSQL_PORT);
console.log("MYSQL_USER:", process.env.MYSQL_USER);
console.log("MYSQL_PASSWORD:", process.env.MYSQL_PASSWORD ? "******" : "não definida");
console.log("MYSQL_DATABASE:", process.env.MYSQL_DATABASE);

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
  console.log("🔄 Usando configuração do Railway");
} else {
  // Ambiente local (desenvolvimento)
  connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "manicure_center"
  });
  console.log("💻 Usando configuração local (127.0.0.1)");
}

connection.connect((err) => {
  if (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
    process.exit(1); // Encerra o processo se não conectar (ajuda a identificar erro)
  } else {
    console.log("✅ MySQL conectado!");
  }
});

module.exports = connection;