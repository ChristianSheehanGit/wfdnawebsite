/**
 * Team Controller - placeholder
 * Handles CRUD for team members.
 */

const TeamMember = require('../models/TeamMember');
const db = require('../services/firestoreDbService');

const TABLE = 'team_members';

/**
 * GET /api/team
 * List all team members ordered by displayOrder (ascending).
 */
async function listTeamMembers(req, res) {
  try {
    const members = await db.findAllOrdered(TABLE, 'displayOrder');
    res.json({ success: true, data: members });
  } catch (err) {
    console.error('[teamController] listTeamMembers error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to list team members' });
  }
}

/**
 * GET /api/team/:id
 * Get a single team member by ID.
 */
async function getTeamMember(req, res) {
  try {
    const member = await db.findById(TABLE, req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Team member not found' });
    }
    res.json({ success: true, data: member });
  } catch (err) {
    console.error('[teamController] getTeamMember error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to get team member' });
  }
}

/**
 * POST /api/team
 * Create a new team member.
 * Body: { name, roles, description, image }
 */
async function createTeamMember(req, res) {
  try {
    const { name, role, description, image } = req.body;
    const member = new TeamMember({ name, role, description, image });

    if (!member.isValid()) {
      return res.status(400).json({ success: false, error: 'Invalid team member data. Name and role are required.' });
    }

    // New members are appended to the end of the list. Use provided
    // displayOrder if present, otherwise fall back to Date.now() so they
    // sort after existing members that lack an explicit order.
    const displayOrder = req.body.displayOrder !== undefined
      ? req.body.displayOrder
      : Date.now();

    const id = await db.insert(TABLE, {
      name: member.name,
      role: member.role,
      description: member.description,
      image: member.image,
      displayOrder,
    });

    res.status(201).json({ success: true, data: { ...member, id, displayOrder } });
  } catch (err) {
    console.error('[teamController] createTeamMember error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create team member' });
  }
}

/**
 * PUT /api/team/:id
 * Update an existing team member.
 */
async function updateTeamMember(req, res) {
  try {
    const { name, role, description, image, displayOrder } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    await db.update(TABLE, req.params.id, updateData);
    res.json({ success: true, message: 'Team member updated' });
  } catch (err) {
    console.error('[teamController] updateTeamMember error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update team member' });
  }
}

/**
 * PUT /api/team/reorder
 * Persist a new ordering for all team members.
 * Body: { orderedIds: ["id1", "id2", ...] }
 * Each id is assigned displayOrder = its index in the array.
 */
async function reorderTeamMembers(req, res) {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: 'orderedIds must be an array of member ids.' });
    }

    const writes = orderedIds.map((id, index) =>
      db.update(TABLE, id, { displayOrder: index })
    );
    await Promise.all(writes);

    res.json({ success: true, message: 'Team member order updated' });
  } catch (err) {
    console.error('[teamController] reorderTeamMembers error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to reorder team members' });
  }
}

/**
 * DELETE /api/team/:id
 * Delete a team member.
 */
async function deleteTeamMember(req, res) {
  try {
    await db.remove(TABLE, req.params.id);
    res.json({ success: true, message: 'Team member deleted' });
  } catch (err) {
    console.error('[teamController] deleteTeamMember error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete team member' });
  }
}

module.exports = { listTeamMembers, getTeamMember, createTeamMember, updateTeamMember, reorderTeamMembers, deleteTeamMember };
