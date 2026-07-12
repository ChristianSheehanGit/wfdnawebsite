/**
 * Email Service - placeholder
 * Handles sending confirmation emails for inquiries and forwarding
 * inquiry data to an internal email address.
 * In production, this would use nodemailer, SendGrid, SES, etc.
 */

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@wolfpackdna.com';
const INTERNAL_EMAIL = process.env.INTERNAL_EMAIL || 'admin@wolfpackdna.com';

/**
 * Send a confirmation email to the person who submitted an inquiry.
 * @param {Object} inquiry - { name, email, subject, message, ... }
 */
async function sendConfirmationEmail(inquiry) {
  // TODO: Implement with nodemailer / SendGrid / SES
  // const msg = {
  //   to: inquiry.email,
  //   from: FROM_EMAIL,
  //   subject: `We received your inquiry: ${inquiry.subject}`,
  //   text: `Hi ${inquiry.name},\n\nThank you for contacting Wolfpack DNA. We've received your message and will get back to you shortly.\n\nYour message:\n${inquiry.message}`,
  // };
  // await sgMail.send(msg);

  console.log(`[PLACEHOLDER EMAIL] Sending confirmation to ${inquiry.email}`);
  console.log(`  From: ${FROM_EMAIL}`);
  console.log(`  Subject: We received your inquiry: ${inquiry.subject}`);
  console.log(`  Body: Thank you ${inquiry.name}, we'll be in touch.`);

  return { success: true, messageId: `placeholder-msg-${Date.now()}` };
}

/**
 * Forward inquiry details to the internal admin email.
 * @param {Object} inquiry
 */
async function forwardInquiryToAdmin(inquiry) {
  // TODO: Implement with nodemailer / SendGrid / SES
  console.log(`[PLACEHOLDER EMAIL] Forwarding inquiry to ${INTERNAL_EMAIL}`);
  console.log(`  From: ${FROM_EMAIL}`);
  console.log(`  Subject: [New Inquiry] ${inquiry.subject} from ${inquiry.name}`);
  console.log(`  Body:`);
  console.log(`    Name: ${inquiry.name}`);
  console.log(`    Email: ${inquiry.email}`);
  console.log(`    Phone: ${inquiry.phone}`);
  console.log(`    Subject: ${inquiry.subject}`);
  console.log(`    Message: ${inquiry.message}`);

  return { success: true, messageId: `placeholder-msg-${Date.now()}` };
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