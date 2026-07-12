/**
 * Case model - placeholder
 * Represents a DNA case with name, description, type, date, and image.
 */
class Case {
  constructor({ id, name, description, type, date, image, live } = {}) {
    this.id = id || null;
    this.name = name || '';
    this.description = description || '';
    this.type = type || '';       // 'law enforcement' | 'genealogy'
    this.date = date || '';       // ISO date string
    this.image = image || '';     // e.g. 'about.jpg' -> references a GCS bucket key
    this.live = live || false;    // Whether the case is currently active/live
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // Placeholder validation
  isValid() {
    return !!(this.name && this.description && this.type);
  }
}

module.exports = Case;