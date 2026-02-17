const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Cliente = require("../models/Cliente");

// Login com email
const login = (req, res) => {
  const { email, senha } = req.body;

  Cliente.buscarPorEmail(email, async (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro no servidor" });
    if (results.length === 0) {
      return res.status(401).json({ erro: "Email não encontrado" });
    }

    const cliente = results[0];
    const valido = await bcrypt.compare(senha, cliente.senha);

    if (!valido) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: cliente.id, nome: cliente.nome, is_admin: cliente.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  });
};

// Registro com email
const register = async (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" });
  }

  const hash = await bcrypt.hash(senha, 10);

  Cliente.criar(nome, email, telefone || null, hash, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ erro: "Email já cadastrado" });
      }
      console.error(err);
      return res.status(500).json({ erro: "Erro ao cadastrar" });
    }
    res.json({ mensagem: "Cadastro realizado com sucesso" });
  });
};

// Rota /me (retorna dados do token)
const getMe = (req, res) => {
  res.json({
    id: req.user.id,
    nome: req.user.nome,
    is_admin: req.user.is_admin
    // email pode ser obtido do banco se necessário, mas o token não tem email
  });
};

module.exports = { login, register, getMe };