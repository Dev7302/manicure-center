const Agendamento = require("../models/Agendamento");

const HORARIOS = [
  "08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00"
];

// Utilitário para gerar um ID de grupo único
function gerarGrupoId(clienteId) {
  return `${clienteId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

exports.horariosOcupados = (req, res) => {
  const { data } = req.params;
  Agendamento.listarPorDia(data, (err, resultados) => {
    if (err) return res.status(500).json({ erro: "Erro" });
    const ocupados = resultados.map(r => r.hora);
    res.json({ horarios: HORARIOS, ocupados });
  });
};

exports.agendar = (req, res) => {
  const { servico, data, hora, duracao } = req.body;
  const clienteId = req.user.id;

  if (!HORARIOS.includes(hora)) {
    return res.status(400).json({ erro: "Horário inválido" });
  }
  
  if (duracao === 2) {
    const [h, m] = hora.split(":");
    const proxHoraInt = parseInt(h) + 1;
    const proxHora = proxHoraInt.toString().padStart(2, '0') + ":" + m;
    if (!HORARIOS.includes(proxHora)) {
      return res.status(400).json({ erro: "Horário não disponível para este serviço (fora do expediente)" });
    }
  }

  // Gera um grupo único para este agendamento (pode ser usado para 1h também, mas não interfere)
  const grupoId = gerarGrupoId(clienteId);

  // Insere o primeiro horário
  Agendamento.criar(clienteId, servico, data, hora, grupoId, err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao agendar" });
    }

    // Se duração for 2, insere o segundo horário com o mesmo grupoId
    if (duracao === 2) {
      const [h, m] = hora.split(":");
      const proxHora = (parseInt(h) + 1).toString().padStart(2, '0') + ":" + m;
      Agendamento.criar(clienteId, servico, data, proxHora, grupoId, (err2) => {
        if (err2) console.error("Erro ao bloquear próximo horário", err2);
      });
    }

    // Enviar e-mail de confirmação (se tiver serviço de email)
    const db = require('../db');
    db.query("SELECT nome, email, telefone FROM clientes WHERE id = ?", [clienteId], (err, results) => {
      if (!err && results.length > 0) {
        const cliente = results[0];
        // Supondo que você tenha um serviço de email configurado
        const emailService = require('../services/emailService');
        emailService.enviarEmailAgendamento(cliente, { servico, data, hora })
          .catch(erro => console.error("Erro no envio de e-mail:", erro));
      }
    });

    res.json({ mensagem: "Agendamento confirmado" });
  });
};

// Listar agendamentos do cliente logado, agrupados por grupo
exports.meusAgendamentos = (req, res) => {
  const db = require('../db');
  const clienteId = req.user.id;
  const sql = `
    SELECT id, servico, data, hora, grupo_id
    FROM agendamentos
    WHERE cliente_id = ?
    ORDER BY data, hora
  `;
  db.query(sql, [clienteId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
    }

    // Agrupa por grupo_id
    const grupos = {};
    results.forEach(item => {
      const chave = item.grupo_id || `single-${item.id}`;
      if (!grupos[chave]) {
        grupos[chave] = {
          id: item.id,
          servico: item.servico,
          data: item.data,
          horarios: [item.hora]
        };
      } else {
        grupos[chave].horarios.push(item.hora);
      }
    });

    const resultado = Object.values(grupos).map(g => {
      g.horarios.sort(); // garante ordem crescente
      const horarioStr = g.horarios.length === 1
        ? g.horarios[0].substring(0,5)
        : `${g.horarios[0].substring(0,5)} - ${g.horarios[g.horarios.length-1].substring(0,5)}`;
      return {
        id: g.id,
        servico: g.servico,
        data: g.data,
        horario: horarioStr
      };
    });

    res.json(resultado);
  });
};

// Cancelar agendamento – cancela todo o grupo
exports.cancelarAgendamento = (req, res) => {
  const db = require('../db');
  const agendamentoId = req.params.id;
  const clienteId = req.user.id;

  // Primeiro, busca o grupo_id do agendamento
  db.query(
    'SELECT grupo_id FROM agendamentos WHERE id = ? AND cliente_id = ?',
    [agendamentoId, clienteId],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ erro: 'Agendamento não encontrado' });
      }

      const grupoId = results[0].grupo_id;

      if (grupoId) {
        // Cancela todos os registros com o mesmo grupo_id
        db.query(
          'DELETE FROM agendamentos WHERE grupo_id = ? AND cliente_id = ?',
          [grupoId, clienteId],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ erro: 'Erro ao cancelar agendamento' });
            }
            res.json({ mensagem: 'Agendamento cancelado com sucesso' });
          }
        );
      } else {
        // Cancela apenas o registro individual
        db.query(
          'DELETE FROM agendamentos WHERE id = ? AND cliente_id = ?',
          [agendamentoId, clienteId],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ erro: 'Erro ao cancelar agendamento' });
            }
            res.json({ mensagem: 'Agendamento cancelado com sucesso' });
          }
        );
      }
    }
  );
};

// Listar todos os agendamentos (admin) – agrupados por grupo
exports.listarTodosAgendamentos = (req, res) => {
  const db = require('../db');
  const sql = `
    SELECT a.id, a.cliente_id, a.servico, a.data, a.hora, a.grupo_id,
           c.nome, c.telefone
    FROM agendamentos a
    JOIN clientes c ON a.cliente_id = c.id
    ORDER BY a.data, a.hora
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
    }

    // Agrupa por grupo_id
    const grupos = {};
    results.forEach(item => {
      const chave = item.grupo_id || `single-${item.id}`;
      if (!grupos[chave]) {
        grupos[chave] = {
          cliente: item.nome,
          telefone: item.telefone,
          servico: item.servico,
          data: item.data,
          horarios: [item.hora]
        };
      } else {
        grupos[chave].horarios.push(item.hora);
      }
    });

    const resultado = Object.values(grupos).map(g => {
      g.horarios.sort();
      const horarioStr = g.horarios.length === 1
        ? g.horarios[0].substring(0,5)
        : `${g.horarios[0].substring(0,5)} - ${g.horarios[g.horarios.length-1].substring(0,5)}`;
      return {
        cliente: g.cliente,
        telefone: g.telefone,
        servico: g.servico,
        data: g.data,
        horario: horarioStr
      };
    });

    res.json(resultado);
  });
};

// Listar agendamentos por data (admin) – agrupados
exports.listarAgendamentosPorData = (req, res) => {
  const db = require('../db');
  const { data } = req.params;
  const sql = `
    SELECT a.id, a.cliente_id, a.servico, a.data, a.hora, a.grupo_id,
           c.nome, c.telefone
    FROM agendamentos a
    JOIN clientes c ON a.cliente_id = c.id
    WHERE a.data = ?
    ORDER BY a.hora
  `;
  db.query(sql, [data], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
    }

    const grupos = {};
    results.forEach(item => {
      const chave = item.grupo_id || `single-${item.id}`;
      if (!grupos[chave]) {
        grupos[chave] = {
          cliente: item.nome,
          telefone: item.telefone,
          servico: item.servico,
          data: item.data,
          horarios: [item.hora]
        };
      } else {
        grupos[chave].horarios.push(item.hora);
      }
    });

    const resultado = Object.values(grupos).map(g => {
      g.horarios.sort();
      const horarioStr = g.horarios.length === 1
        ? g.horarios[0].substring(0,5)
        : `${g.horarios[0].substring(0,5)} - ${g.horarios[g.horarios.length-1].substring(0,5)}`;
      return {
        cliente: g.cliente,
        telefone: g.telefone,
        servico: g.servico,
        data: g.data,
        horario: horarioStr
      };
    });

    res.json(resultado);
  });
};