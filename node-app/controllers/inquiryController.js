/**
 * Inquiry Controller - placeholder
 * Handles receiving contact form submissions, sending confirmation emails,
 * and forwarding inquiry data to the internal admin email.
 */

const Inquiry = require('../models/Inquiry');
const emailService = require('../services/emailService');
const db = require('../services/firestoreDbService');

/**
 * POST /api/inquiries
 * Submit a contact form inquiry.
 * Body: { name, email, phone, subject, message }
 */
async function submitInquiry(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body;
    const inquiry = new Inquiry({ name, email, phone, subject, message });

    if (!inquiry.isValid()) {
      return res.status(400).json({ success: false, error: 'Invalid inquiry. Name, email, and message are required.' });
    }

    // Save inquiry to Firestore
    const inquiryId = await db.insert('inquiries', {
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      subject: inquiry.subject,
      message: inquiry.message,
    });

    // Send confirmation to the submitter and forward to admin
    const emailResults = await emailService.processInquiryEmails(inquiry);

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: { id: inquiryId, inquiry, emails: emailResults },
    });
  } catch (err) {
    console.error('[inquiryController] submitInquiry error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to submit inquiry' });
  }
}

module.exports = { submitInquiry };