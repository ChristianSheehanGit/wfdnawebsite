/**
 * Case Controller - placeholder
 * Handles CRUD for DNA cases.
 */

const Case = require('../models/Case');
const db = require('../services/firestoreDbService');

const TABLE = 'cases';

/**
 * GET /api/cases
 * List all cases.
 */
async function listCases(req, res) {
  try {
    const cases = await db.findAll(TABLE);
    res.json({ success: true, data: cases });
  } catch (err) {
    console.error('[caseController] listCases error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to list cases' });
  }
}

/**
 * GET /api/cases/:id
 * Get a single case by ID.
 */
async function getCase(req, res) {
  try {
    const caseItem = await db.findById(TABLE, req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }
    res.json({ success: true, data: caseItem });
  } catch (err) {
    console.error('[caseController] getCase error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to get case' });
  }
}

/**
 * POST /api/cases
 * Create a new case.
 * Body: { name, description, type, date, image, live }
 */
async function createCase(req, res) {
  try {
    const { name, description, type, date, image, live, givebutter_url } = req.body;
    const newCase = new Case({ name, description, type, date, image, live, givebutter_url });

    if (!newCase.isValid()) {
      return res.status(400).json({ success: false, error: 'Invalid case data. Name, description, and type are required.' });
    }

    const id = await db.insert(TABLE, {
      name: newCase.name,
      description: newCase.description,
      type: newCase.type,
      date: newCase.date,
      image: newCase.image,
      live: newCase.live,
      givebutter_url: newCase.givebutter_url,
    });

    res.status(201).json({ success: true, data: { ...newCase, id } });
  } catch (err) {
    console.error('[caseController] createCase error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create case' });
  }
}

/**
 * PUT /api/cases/:id
 * Update an existing case.
 */
async function updateCase(req, res) {
  try {
    const { name, description, type, date, image, live, givebutter_url } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (date !== undefined) updateData.date = date;
    if (image !== undefined) updateData.image = image;
    if (live !== undefined) updateData.live = live;
    if (givebutter_url !== undefined) updateData.givebutter_url = givebutter_url;

    await db.update(TABLE, req.params.id, updateData);
    res.json({ success: true, message: 'Case updated' });
  } catch (err) {
    console.error('[caseController] updateCase error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update case' });
  }
}

/**
 * DELETE /api/cases/:id
 * Delete a case.
 */
async function deleteCase(req, res) {
  try {
    await db.remove(TABLE, req.params.id);
    res.json({ success: true, message: 'Case deleted' });
  } catch (err) {
    console.error('[caseController] deleteCase error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete case' });
  }
}

module.exports = { listCases, getCase, createCase, updateCase, deleteCase };