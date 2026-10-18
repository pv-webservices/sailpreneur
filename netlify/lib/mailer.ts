// SMTP delivery through the academy's own mailbox (Zoho Mail: smtp.zoho.in, port 465, SSL).
// Because Zoho's own server sends the message, it passes the domain's SPF, DKIM and DMARC checks.
import nodemailer from 'nodemailer';
import type { MailConfig } from './config.ts';
import type { MailMessage } from './email.ts';

/** Netlify functions stop after ~10 seconds by default, so SMTP must give up well before that. */
const SMTP_TIMEOUT_MS = 8000;

export async function sendWithSmtp(config: MailConfig, message: MailMessage): Promise<void> {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
  });
  try {
    await transport.sendMail(message);
  } finally {
    transport.close();
  }
}
