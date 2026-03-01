const express = require('express');
const router = express.Router();
const {
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
} = require('../controllers/medicalController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/:animal_id', authenticateToken, getMedicalRecords);
router.post('/', authenticateToken, authorizeRoles('admin', 'volunteer'), createMedicalRecord);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'volunteer'), updateMedicalRecord);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteMedicalRecord);

module.exports = router;
