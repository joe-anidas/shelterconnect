//utils/email.js

import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass }
  });
} else {
  console.warn('⚠️  SMTP not configured. Emails will be logged to console.');
}

export async function sendEmail({ to, subject, text, html }) {
  if (!to) throw new Error('Email "to" address is required');

  const from = process.env.EMAIL_FROM || 'shelterconnect@system.local';

  if (!transporter) {
    console.log('📧 Email (console):', { to, subject, text, html });
    return { success: true, mocked: true };
  }

  const info = await transporter.sendMail({ from, to, subject, text, html });
  return { success: true, messageId: info.messageId };
}

export default { sendEmail };


