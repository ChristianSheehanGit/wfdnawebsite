/**
 * Email Service
 * Handles sending confirmation emails for inquiries and forwarding
 * inquiry data to an internal email address using Nodemailer via SMTP.
 */

const nodemailer = require('nodemailer');

// ---------------------------------------------------------------------------
// Configuration from environment variables (read lazily at send time so
// this module works regardless of when dotenv is loaded).
// ---------------------------------------------------------------------------
function getConfig() {
  const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '465', 10);
  const EMAIL_USER = process.env.EMAIL_USER || 'submissions@wolfpackdna.com';
  const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD || '';
  const FROM_EMAIL = process.env.FROM_EMAIL || EMAIL_USER;
  const INTERNAL_EMAIL = process.env.INTERNAL_EMAIL || 'admin@wolfpackdna.com';

  return {
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    user: EMAIL_USER,
    appPassword: EMAIL_APP_PASSWORD,
    fromEmail: FROM_EMAIL,
    internalEmail: INTERNAL_EMAIL,
  };
}

let cachedTransporter = null;

/**
 * Get a nodemailer transporter. Uses a connection pool so multiple
 * sends (confirmation + internal forward) reuse the same SMTP connection.
 */
function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const { host, port, user, appPassword } = getConfig();

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587/STARTTLS
    auth: {
      user,
      pass: appPassword,
    },
  });

  return cachedTransporter;
}

function emailServiceEnabled() {
  return Boolean(getConfig().appPassword);
}

/**
 * Convert an HTML message (from the inquiry summary) into a plain-text
 * fallback for email clients that do not render HTML.
 * @param {string} html
 * @returns {string}
 */
function htmlToText(html) {
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/u>/gi, '')
    .replace(/<u>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#38;/g, '&')
    .replace(/&#60;/g, '<')
    .replace(/&#62;/g, '>')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Send a confirmation email to the person who submitted an inquiry.
 * @param {Object} inquiry - { name, email, phone, subject, message, ... }
 */
async function sendConfirmationEmail(inquiry) {
  if (!emailServiceEnabled()) {
    console.warn(
      '[Email] EMAIL_APP_PASSWORD not set. Skipping confirmation email to ' + inquiry.email
    );
    return { success: false, skipped: true, reason: 'EMAIL_APP_PASSWORD not configured' };
  }

  const { fromEmail } = getConfig();

  const subject = inquiry.subject
    ? `We received your inquiry: ${inquiry.subject}`
    : 'We received your inquiry';

  const messageHtml = inquiry.message || '';
  const messageText = htmlToText(inquiry.message || '');

  const html = [
    `<p>Hi ${htmlToText(inquiry.name)},</p>`,
    '<p>Thank you for contacting Wolfpack DNA. We have received your inquiry and will get back to you shortly.</p>',
    '<p><u>--- Your inquiry ---</u></p>',
    `<p>${messageHtml}</p>`,
    '<p>Best regards,<br>The Wolfpack DNA Team</p>',
  ].join('\n');

  const text = [
    `Hi ${inquiry.name},`,
    '',
    'Thank you for contacting Wolfpack DNA. We have received your inquiry and will get back to you shortly.',
    '',
    '--- Your inquiry ---',
    messageText,
    '',
    'Best regards,',
    'The Wolfpack DNA Team',
  ].join('\n');

  const info = await getTransporter().sendMail({
    from: `"Wolfpack DNA" <${fromEmail}>`,
    to: inquiry.email,
    subject,
    text,
    html,
  });

  console.log(`[Email] Confirmation sent to ${inquiry.email}: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}

/**
 * Forward inquiry details to the internal admin email.
 * @param {Object} inquiry
 */
async function forwardInquiryToAdmin(inquiry) {
  if (!emailServiceEnabled()) {
    console.warn('[Email] EMAIL_APP_PASSWORD not set. Skipping internal forward.');
    return { success: false, skipped: true, reason: 'EMAIL_APP_PASSWORD not configured' };
  }

  const { fromEmail, internalEmail } = getConfig();

  const subject = `[New Inquiry] ${inquiry.subject || 'No subject'} from ${inquiry.name}`;

  const messageHtml = inquiry.message || '';
  const messageText = htmlToText(inquiry.message || '');

  const html = [
    '<p>A new inquiry has been submitted on the Wolfpack DNA website:</p>',
    '<p>',
    `<p>${messageHtml}</p>`,
    `<p><u>Submitted:</u> ${new Date().toISOString()}</p>`,
  ].join('\n');

  const text = [
    'A new inquiry has been submitted on the Wolfpack DNA website:',
    '',
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : 'Phone: N/A',
    `Subject: ${inquiry.subject || 'N/A'}`,
    '',
    'Message:',
    messageText,
    '',
    `Submitted: ${new Date().toISOString()}`,
  ].join('\n');

  const info = await getTransporter().sendMail({
    from: `"Wolfpack DNA Website" <${fromEmail}>`,
    to: internalEmail,
    replyTo: inquiry.email,
    subject,
    text,
    html,
  });

  console.log(`[Email] Internal forward sent to ${internalEmail}: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}

/**
 * Send both the confirmation and the internal notification.
 */
async function processInquiryEmails(inquiry) {
  const confirmation = await sendConfirmationEmail(inquiry);
  const forward = await forwardInquiryToAdmin(inquiry);
  return { confirmation, forward };
}

module.exports = { sendConfirmationEmail, forwardInquiryToAdmin, processInquiryEmails };