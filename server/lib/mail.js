import { Resend } from 'resend';

function readMailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.FEEDBACK_MAIL_FROM?.trim() || 'onboarding@resend.dev';
  const to = process.env.FEEDBACK_MAIL_TO?.trim() || 'simone.sarro@outlook.it';

  if (!apiKey || !from || !to) {
    return null;
  }

  return {
    apiKey,
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
  const mailConfig = readMailConfig();

  if (!mailConfig) {
    console.info('[feedback-mail] resend disabled or incomplete configuration');
    return {
      delivered: false,
      channel: 'disabled',
      mailbox: 'simone.sarro@outlook.it',
    };
  }

  console.info('[feedback-mail] resend configuration detected', {
    from: mailConfig.from,
    to: mailConfig.to,
    hasReplyTo: Boolean(feedback.email),
  });

  const resend = new Resend(mailConfig.apiKey);
  const result = await resend.emails.send({
    from: mailConfig.from,
    to: [mailConfig.to],
    replyTo: feedback.email || undefined,
    subject: `Feedback AdFido - ${feedback.name || 'Utente sito'}`,
    text: buildFeedbackMailBody(feedback),
  });

  if (result.error) {
    throw new Error(result.error.message || 'Resend delivery failed.');
  }

  console.info('[feedback-mail] resend delivery completed', {
    to: mailConfig.to,
    replyTo: feedback.email || null,
    emailId: result.data?.id ?? null,
  });

  return {
    delivered: true,
    channel: 'resend',
    mailbox: mailConfig.to,
    providerId: result.data?.id ?? null,
  };
}
