const nodemailer = require('nodemailer');

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function createTransport() {
  if (!hasSmtpConfig()) return null;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure =
    process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1' || port === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

let cachedTransport = null;

function getTransport() {
  if (!hasSmtpConfig()) return null;
  if (!cachedTransport) cachedTransport = createTransport();
  return cachedTransport;
}

/**
 * @param {{ name: string; email?: string; phone?: string; message?: string; propertyType?: string; source?: string }} inquiry
 */
async function sendInquiryNotification(inquiry) {
  const to = (process.env.INQUIRY_NOTIFY_EMAIL || process.env.SMTP_FROM || '').trim();
  if (!to) {
    console.warn('INQUIRY_NOTIFY_EMAIL / SMTP_FROM not set; skipping inquiry email');
    return { sent: false, reason: 'no_recipient' };
  }

  const transport = getTransport();
  if (!transport) {
    console.warn('SMTP not configured (SMTP_HOST / SMTP_FROM); inquiry saved but no email sent');
    return { sent: false, reason: 'no_smtp' };
  }

  const lines = [
    'New inquiry from the website',
    '',
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email || '—'}`,
    `Phone: ${inquiry.phone || '—'}`,
    `Source: ${inquiry.source || 'global'}`,
  ];
  if (inquiry.propertyType) lines.push(`Property type: ${inquiry.propertyType}`);
  lines.push('', 'Message:', inquiry.message || '—');

  const subject = `[GT Estate] New inquiry — ${inquiry.name}`;

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    replyTo: inquiry.email || undefined,
    subject,
    text: lines.join('\n'),
  });

  return { sent: true };
}

module.exports = { sendInquiryNotification, hasSmtpConfig, getTransport };
