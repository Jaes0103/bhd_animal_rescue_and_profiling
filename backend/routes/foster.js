const express = require('express');
const router = express.Router();
const {
  getFosterRecords,
  getActiveFosterByAnimal,
  createFosterRecord,
  updateFosterRecord,
  addFosterUpdate,
  getFosterUpdates
} = require('../controllers/fosterController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles('admin', 'volunteer'), getFosterRecords);
router.get('/animal/:animalId', authenticateToken, authorizeRoles('admin', 'volunteer'), getActiveFosterByAnimal);
router.post('/', authenticateToken, authorizeRoles('admin', 'volunteer'), createFosterRecord);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'volunteer'), updateFosterRecord);
router.post('/:foster_care_id/updates', authenticateToken, authorizeRoles('admin', 'volunteer'), addFosterUpdate);
router.get('/:foster_care_id/updates', authenticateToken, authorizeRoles('admin', 'volunteer'), getFosterUpdates);

module.exports = router;
