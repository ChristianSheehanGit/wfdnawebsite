const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/', teamController.listTeamMembers);
router.get('/:id', teamController.getTeamMember);
router.post('/', teamController.createTeamMember);
router.put('/reorder', teamController.reorderTeamMembers);
router.put('/:id', teamController.updateTeamMember);
router.delete('/:id', teamController.deleteTeamMember);

module.exports = router;