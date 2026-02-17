// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) console.error('❌ Erro na configuração do e-mail:', error);
  else console.log('✅ Serviço de e-mail pronto');
});

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
  const horaFormatada = agendamento.hora.substring(0,5);

  const clienteMail = {
    from: `"Manicure Center" <${process.env.EMAIL_USER}>`,
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
  };

  const adminMail = {
    from: `"Sistema Manicure" <${process.env.EMAIL_USER}>`,
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
  };

  try {
    if (cliente.email) await transporter.sendMail(clienteMail);
    await transporter.sendMail(adminMail);
    console.log(`✅ E-mails enviados para ${cliente.email} e admin`);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mails:', error);
    throw error;
  }
};

exports.enviarEmailCancelamento = async (cliente, agendamento) => {
  const servicoNome = servicosMap[agendamento.servico] || agendamento.servico;
  const dataObj = new Date(agendamento.data + 'T12:00:00');
  const dataFormatada = dataObj.toLocaleDateString('pt-BR');
  const horaFormatada = agendamento.hora.substring(0,5);

  const clienteMail = {
    from: `"Manicure Center" <${process.env.EMAIL_USER}>`,
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
  };

  const adminMail = {
    from: `"Sistema Manicure" <${process.env.EMAIL_USER}>`,
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
  };

  try {
    if (cliente.email) await transporter.sendMail(clienteMail);
    await transporter.sendMail(adminMail);
    console.log(`✅ E-mails de cancelamento enviados para ${cliente.email} e admin`);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mails de cancelamento:', error);
  }
};