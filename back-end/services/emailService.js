// services/emailService.js
console.log('📧 Carregando emailService.js');
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
  // Objeto dummy para não quebrar a aplicação
  resend = { emails: { send: () => { throw new Error('Resend não configurado') } } };
}

// 🔧 E-mail de teste (substitua pelo seu e-mail verificado no Resend)
const EMAIL_TESTE = 'enzo.frangiotte@gmail.com';

/**
 * Envia email de confirmação de agendamento (sempre para o e-mail de teste)
 */
exports.enviarEmailAgendamento = async (cliente, agendamento) => {
  const servicoNome = servicosMap[agendamento.servico] || agendamento.servico;
  const dataObj = new Date(agendamento.data + 'T12:00:00');
  const dataFormatada = dataObj.toLocaleDateString('pt-BR');
  const horaFormatada = agendamento.hora.substring(0,5);

  // Monta o HTML
  const htmlCliente = `
    <h2>Olá ${cliente.nome}!</h2>
    <p>Seu agendamento foi confirmado com sucesso:</p>
    <ul>
      <li><strong>Serviço:</strong> ${servicoNome}</li>
      <li><strong>Data:</strong> ${dataFormatada}</li>
      <li><strong>Horário:</strong> ${horaFormatada}</li>
    </ul>
    <p>Em caso de cancelamento, acesse nossa plataforma.</p>
    <p>Agradecemos a preferência! 💅</p>
  `;

  const htmlAdmin = `
    <h2>Novo agendamento!</h2>
    <ul>
      <li><strong>Cliente:</strong> ${cliente.nome}</li>
      <li><strong>Telefone:</strong> ${cliente.telefone || 'não informado'}</li>
      <li><strong>E-mail:</strong> ${cliente.email}</li>
      <li><strong>Serviço:</strong> ${servicoNome}</li>
      <li><strong>Data:</strong> ${dataFormatada}</li>
      <li><strong>Horário:</strong> ${horaFormatada}</li>
    </ul>
  `;

  try {
    // Envia para o e-mail de teste (simula cliente)
    const { data, error } = await resend.emails.send({
      from: 'Manicure Center <onboarding@resend.dev>',
      to: [EMAIL_TESTE],
      subject: '✅ Agendamento confirmado - Manicure Center',
      html: htmlCliente
    });

    if (error) {
      console.error('❌ Erro Resend (cliente):', error);
    } else {
      console.log(`✅ Email de agendamento enviado para ${EMAIL_TESTE} (ID: ${data?.id})`);
    }

    // Envia também uma cópia para o admin (para o mesmo e-mail de teste)
    const { data: dataAdmin, error: errorAdmin } = await resend.emails.send({
      from: 'Sistema Manicure <onboarding@resend.dev>',
      to: [EMAIL_TESTE],
      subject: '🆕 Novo agendamento realizado',
      html: htmlAdmin
    });

    if (errorAdmin) {
      console.error('❌ Erro Resend (admin):', errorAdmin);
    } else {
      console.log(`✅ Email de admin enviado para ${EMAIL_TESTE} (ID: ${dataAdmin?.id})`);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar emails:', error);
  }
};

/**
 * Envia email de cancelamento de agendamento (sempre para o e-mail de teste)
 */
exports.enviarEmailCancelamento = async (cliente, agendamento) => {
  const servicoNome = servicosMap[agendamento.servico] || agendamento.servico;
  const dataObj = new Date(agendamento.data + 'T12:00:00');
  const dataFormatada = dataObj.toLocaleDateString('pt-BR');
  const horaFormatada = agendamento.hora.substring(0,5);

  const htmlCliente = `
    <h2>Olá ${cliente.nome}!</h2>
    <p>Seu agendamento foi cancelado:</p>
    <ul>
      <li><strong>Serviço:</strong> ${servicoNome}</li>
      <li><strong>Data:</strong> ${dataFormatada}</li>
      <li><strong>Horário:</strong> ${horaFormatada}</li>
    </ul>
    <p>Se desejar remarcar, acesse nossa plataforma.</p>
    <p>Estamos à disposição! 💅</p>
  `;

  const htmlAdmin = `
    <h2>Um agendamento foi cancelado</h2>
    <ul>
      <li><strong>Cliente:</strong> ${cliente.nome}</li>
      <li><strong>Telefone:</strong> ${cliente.telefone || 'não informado'}</li>
      <li><strong>E-mail:</strong> ${cliente.email}</li>
      <li><strong>Serviço:</strong> ${servicoNome}</li>
      <li><strong>Data:</strong> ${dataFormatada}</li>
      <li><strong>Horário:</strong> ${horaFormatada}</li>
    </ul>
  `;

  try {
    // Envia para o e-mail de teste (simula cliente)
    const { data, error } = await resend.emails.send({
      from: 'Manicure Center <onboarding@resend.dev>',
      to: [EMAIL_TESTE],
      subject: '❌ Agendamento cancelado - Manicure Center',
      html: htmlCliente
    });

    if (error) {
      console.error('❌ Erro Resend (cancelamento cliente):', error);
    } else {
      console.log(`✅ Email de cancelamento enviado para ${EMAIL_TESTE} (ID: ${data?.id})`);
    }

    // Envia também para o admin
    const { data: dataAdmin, error: errorAdmin } = await resend.emails.send({
      from: 'Sistema Manicure <onboarding@resend.dev>',
      to: [EMAIL_TESTE],
      subject: '❌ Agendamento cancelado',
      html: htmlAdmin
    });

    if (errorAdmin) {
      console.error('❌ Erro Resend (cancelamento admin):', errorAdmin);
    } else {
      console.log(`✅ Email de cancelamento admin enviado para ${EMAIL_TESTE} (ID: ${dataAdmin?.id})`);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar emails de cancelamento:', error);
  }
};