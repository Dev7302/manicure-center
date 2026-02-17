// services/emailService.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const servicosMap = {
  'mao': 'Mão',
  'pe': 'Pé',
  'pe_spa': 'Pé com spa',
  'pe_mao_sem_spa': 'Pé e mão sem spa',
  'pe_mao_com_spa': 'Pé e mão com spa'
};

exports.enviarEmailAgendamento = async (cliente, agendamento) => {
  const servicoNome = servicosMap[agendamento.servico] || agendamento.servico;
  const dataObj = new Date(agendamento.data + 'T12:00:00');
  const dataFormatada = dataObj.toLocaleDateString('pt-BR');
  const horaFormatada = agendamento.hora.substring(0, 5);

  try {
    // Email para cliente
    if (cliente.email) {
      await resend.emails.send({
        from: 'Manicure Center <onboarding@resend.dev>',
        to: cliente.email,
        subject: '✅ Agendamento confirmado - Manicure Center',
        html: `
          <h2>Olá ${cliente.nome}!</h2>
          <p>Seu agendamento foi confirmado com sucesso:</p>
          <ul>
            <li><strong>Serviço:</strong> ${servicoNome}</li>
            <li><strong>Data:</strong> ${dataFormatada}</li>
            <li><strong>Horário:</strong> ${horaFormatada}</li>
          </ul>
          <p>Em caso de cancelamento, acesse nossa plataforma.</p>
          <p>Agradecemos a preferência! 💅</p>
        `
      });
    }

    // Email para admin
    await resend.emails.send({
      from: 'Manicure Center <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject: '🆕 Novo agendamento realizado',
      html: `
        <h2>Novo agendamento!</h2>
        <ul>
          <li><strong>Cliente:</strong> ${cliente.nome}</li>
          <li><strong>Telefone:</strong> ${cliente.telefone || 'não informado'}</li>
          <li><strong>E-mail:</strong> ${cliente.email}</li>
          <li><strong>Serviço:</strong> ${servicoNome}</li>
          <li><strong>Data:</strong> ${dataFormatada}</li>
          <li><strong>Horário:</strong> ${horaFormatada}</li>
        </ul>
      `
    });

    console.log("✅ Emails enviados com sucesso via Resend!");
  } catch (error) {
    console.error("❌ Erro ao enviar emails:", error);
    throw error;
  }
};

exports.enviarEmailCancelamento = async (cliente, agendamento) => {
  const servicoNome = servicosMap[agendamento.servico] || agendamento.servico;
  const dataObj = new Date(agendamento.data + 'T12:00:00');
  const dataFormatada = dataObj.toLocaleDateString('pt-BR');
  const horaFormatada = agendamento.hora.substring(0, 5);

  try {
    if (cliente.email) {
      await resend.emails.send({
        from: 'Manicure Center <onboarding@resend.dev>',
        to: cliente.email,
        subject: '❌ Agendamento cancelado - Manicure Center',
        html: `
          <h2>Olá ${cliente.nome}!</h2>
          <p>Seu agendamento foi cancelado:</p>
          <ul>
            <li><strong>Serviço:</strong> ${servicoNome}</li>
            <li><strong>Data:</strong> ${dataFormatada}</li>
            <li><strong>Horário:</strong> ${horaFormatada}</li>
          </ul>
          <p>Se desejar remarcar, acesse nossa plataforma.</p>
          <p>Estamos à disposição! 💅</p>
        `
      });
    }

    await resend.emails.send({
      from: 'Manicure Center <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject: '❌ Agendamento cancelado',
      html: `
        <h2>Um agendamento foi cancelado</h2>
        <ul>
          <li><strong>Cliente:</strong> ${cliente.nome}</li>
          <li><strong>Telefone:</strong> ${cliente.telefone || 'não informado'}</li>
          <li><strong>E-mail:</strong> ${cliente.email}</li>
          <li><strong>Serviço:</strong> ${servicoNome}</li>
          <li><strong>Data:</strong> ${dataFormatada}</li>
          <li><strong>Horário:</strong> ${horaFormatada}</li>
        </ul>
      `
    });

    console.log("✅ Emails de cancelamento enviados via Resend!");
  } catch (error) {
    console.error("❌ Erro ao enviar emails de cancelamento:", error);
  }
};
