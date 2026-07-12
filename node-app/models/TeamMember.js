/**
 * TeamMember model - placeholder
 * Represents a team member with name, roles, description, and image.
 */
class TeamMember {
  constructor({ id, name, role, description, image, displayOrder } = {}) {
    this.id = id || null;
    this.name = name || '';
    this.role = role || '';       // e.g. 'Lead Genealogist'
    this.description = description || '';
    this.image = image || '';     // e.g. 'team-member.jpg' -> GCS bucket key
    // displayOrder controls manual ordering on the admin/cards UI.
    // When undefined, falls back to createdAt for sorting.
    this.displayOrder = displayOrder;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  isValid() {
    return !!(this.name && this.role);
  }
}

module.exports = TeamMember;