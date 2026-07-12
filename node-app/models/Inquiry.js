/**
 * Inquiry model - placeholder
 * Represents a contact form submission with sender info and message.
 */
class Inquiry {
  constructor({ id, name, email, phone, subject, message } = {}) {
    this.id = id || null;
    this.name = name || '';
    this.email = email || '';
    this.phone = phone || '';
    this.subject = subject || '';
    this.message = message || '';
    this.submittedAt = new Date().toISOString();
  }

  isValid() {
    return !!(this.name && this.email && this.message);
  }
}

module.exports = Inquiry;