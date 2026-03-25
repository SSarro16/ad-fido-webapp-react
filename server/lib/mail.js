import nodemailer from 'nodemailer';

const MAIL_TIMEOUT_MS = 12000;

function readSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.FEEDBACK_MAIL_FROM?.trim() || user;
  const to = process.env.FEEDBACK_MAIL_TO?.trim() || 'simone.sarro@outlook.it';

  if (!host || !port || !user || !pass || !from || !to) {
    return null;
  }

  return {
    host,
    port,
    secure: String(process.env.SMTP_SECURE ?? 'false') === 'true',
    auth: { user, pass },
    from,
    to,
  };
}

function buildFeedbackMailBody({ name, email, message, createdAt }) {
  return [
    'Nuovo feedback dal sito AdFido',
    '',
    `Data: ${createdAt}`,
    `Nome: ${name || 'Non specificato'}`,
    `Email: ${email || 'Non specificata'}`,
    '',
    'Messaggio:',
    message,
  ].join('\n');
}

export async function sendFeedbackMail(feedback) {
  const smtpConfig = readSmtpConfig();

  if (!smtpConfig) {
    return {
      delivered: false,
      channel: 'disabled',
      mailbox: 'simone.sarro@outlook.it',
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: smtpConfig.auth,
    connectionTimeout: MAIL_TIMEOUT_MS,
    greetingTimeout: MAIL_TIMEOUT_MS,
    socketTimeout: MAIL_TIMEOUT_MS,
  });

  await Promise.race([
    transporter.sendMail({
      from: smtpConfig.from,
      to: smtpConfig.to,
      replyTo: feedback.email || undefined,
      subject: `Feedback AdFido - ${feedback.name || 'Utente sito'}`,
      text: buildFeedbackMailBody(feedback),
    }),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SMTP delivery timeout exceeded.')), MAIL_TIMEOUT_MS);
    }),
  ]);

  return {
    delivered: true,
    channel: 'smtp',
    mailbox: smtpConfig.to,
  };
}
