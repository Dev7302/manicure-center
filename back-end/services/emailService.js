// services/emailService.js
const { Resend } = require('resend');

// Mapeamento de serviços para nomes amigáveis
const servicosMap = {
  'mao': 'Mão',
  'pe': 'Pé',
  'pe_spa': 'Pé com spa',
  'pe_mao_sem_spa': 'Pé e mão sem spa',
  'pe_mao_com_spa': 'Pé e mão com spa'
};

let resend;

try {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY não configurada no ambiente');
  }
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Serviço Resend inicializado');
} catch (error) {
  console.error('❌ Erro ao inicializar Resend:', error.message);
  // Criamos um objeto dummy para evitar crash, mas as funções vão falhar
  resend = { emails: { send: () => { throw new Error('Resend não configurado') } } };
}

/**
 * Envia email de confirmação de agendamento
 */
exports.enviarEmailAgendamento = async (cliente, agendamento) => {
  const servicoNome = servicosMap[agendamento.servico] || agendamento.servico;
  const dataObj = new Date(agendamento.data + 'T12:00:00');
  const dataFormatada = dataObj.toLocaleDateString('pt-BR');
  const horaFormatada = agendamento.hora.substring(0,5);

  // Email para o cliente
  if (cliente.email) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Manicure Center <onboarding@resend.dev>', // Altere após verificar domínio
        to: [cliente.email],
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

      if (error) {
        console.error('❌ Erro Resend (cliente):', error);
      } else {
        console.log(`✅ Email enviado para cliente ${cliente.email} (ID: ${data?.id})`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email para cliente:', error);
    }
  }

  // Email para administradora
  if (process.env.ADMIN_EMAIL) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Sistema Manicure <onboarding@resend.dev>',
        to: [process.env.ADMIN_EMAIL],
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

      if (error) {
        console.error('❌ Erro Resend (admin):', error);
      } else {
        console.log(`✅ Email enviado para admin ${process.env.ADMIN_EMAIL} (ID: ${data?.id})`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email para admin:', error);
    }
  }
};

/**
 * Envia email de cancelamento de agendamento
 */
exports.enviarEmailCancelamento = async (cliente, agendamento) => {
  const servicoNome = servicosMap[agendamento.servico] || agendamento.servico;
  const dataObj = new Date(agendamento.data + 'T12:00:00');
  const dataFormatada = dataObj.toLocaleDateString('pt-BR');
  const horaFormatada = agendamento.hora.substring(0,5);

  // Email para o cliente
  if (cliente.email) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Manicure Center <onboarding@resend.dev>',
        to: [cliente.email],
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

      if (error) {
        console.error('❌ Erro Resend (cancelamento cliente):', error);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar cancelamento para cliente:', error);
    }
  }

  // Email para administradora
  if (process.env.ADMIN_EMAIL) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Sistema Manicure <onboarding@resend.dev>',
        to: [process.env.ADMIN_EMAIL],
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

      if (error) {
        console.error('❌ Erro Resend (cancelamento admin):', error);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar cancelamento para admin:', error);
    }
  }
};