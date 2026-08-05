/**
 * Inquiry Controller
 * Handles receiving inquiry form submissions and sending confirmation emails.
 */

const Inquiry = require('../models/Inquiry');
const emailService = require('../services/emailService');

/**
 * Escape a value for safe inclusion in HTML email body.
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&#38;')
    .replace(/</g, '&#60;')
    .replace(/>/g, '&#62;')
    .replace(/"/g, '&#34;')
    .replace(/'/g, '&#39;');
}

/**
 * Build a readable HTML summary of all the form's fields.
 * Each label is underlined (using <u> tags) followed by the value.
 * @param {Object} data - The full payload from the form
 * @returns {string} An HTML string of every field/value
 */
function buildMessageSummary(data) {
  const labelMap = {
    firstName: 'First Name',
    lastName: 'Last Name',
    jobTitle: 'Job Title',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    stateRegion: 'State/Province/Region',
    county: 'County',
    country: 'Country',
    agencyName: 'Agency Name',
    codisProfile: 'Has a profile been entered into CODIS?',
    approvedLabs: 'Approved labs per state laws',
    priorDnaTesting: 'Prior DNA testing',
    samplesAvailable: 'Samples available for DNA testing',
    caseName: 'Case name',
    namusNumber: 'NamUs Number',
    previousIgg: 'Previous investigative genetic genealogy',
    otherInfo: 'Other relevant information',
    heardAbout: 'How did you hear about us?',
    dateOfBirth: 'Date of Birth',
    placeOfBirth: 'Place of Birth',
    dnaTest: 'DNA test taken',
    dnaUpload: 'DNA uploaded to public databases',
    previousResearch: 'Previous genealogical research',
    searchingFor: 'Searching for biological mother/father/both',
    researchFindings: 'Previous research findings',
    additionalInfo: 'Additional information',
    inquiryType: 'Inquiry Type',
    other: 'Other',
  };

  const excludeKeys = ['name', 'email', 'phone', 'subject', 'message', 'inquiryType'];

  const lines = [];
  if (data.inquiryType) {
    lines.push(`<u>Inquiry Type:</u> ${escapeHtml(data.inquiryType)}`);
  }
  for (const [key, value] of Object.entries(data)) {
    if (excludeKeys.includes(key) || value === undefined || value === null) {
      continue;
    }
    const strValue = String(value).trim();
    if (!strValue) {
      continue;
    }
    const label = labelMap[key] || key;
    lines.push(`<u>${escapeHtml(label)}:</u> ${escapeHtml(strValue)}`);
  }
  return lines.join('<br>');
}

/**
 * POST /api/inquiries
 * Submit an inquiry form.
 * Body: All form fields (e.g. firstName, lastName, emailAddress, ...)
 *       plus derived fields { name, email, inquiryType }.
 * Sends a confirmation email to the address provided in the form
 * and forwards the full inquiry to the configured admin email.
 */
async function submitInquiry(req, res) {
  try {
    const data = req.body || {};

    // Derived fields sent from the frontend
    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const phone = data.phoneNumber || data.phone || '';
    const subject = data.inquiryType || 'Website Inquiry';
    const message = buildMessageSummary(data);

    const inquiry = new Inquiry({ name, email, phone, subject, message });

    if (!inquiry.isValid()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid inquiry. Name and email are required.',
      });
    }

    // Send confirmation to the submitter and forward the full inquiry to the admin email
    const emailResults = await emailService.processInquiryEmails(inquiry);

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: { inquiry, emails: emailResults },
    });
  } catch (err) {
    console.error('[inquiryController] submitInquiry error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to submit inquiry' });
  }
}

module.exports = { submitInquiry };