const express = require('express');
const router = express.Router();
const {
  getMedications,
  getMedicationsDueToday,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  markMedicationAsGiven,
  getAnimalMedicationHistory
} = require('../controllers/medicationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all medications with filters
router.get('/', authenticateToken, getMedications);

// Get medications due today
router.get('/due-today', authenticateToken, getMedicationsDueToday);

// Get medication by ID
router.get('/:id', authenticateToken, getMedicationById);

// Get medication history for an animal
router.get('/animal/:animalId', authenticateToken, getAnimalMedicationHistory);

// Create new medication
router.post('/', authenticateToken, authorizeRoles('admin', 'staff', 'volunteer'), createMedication);

// Mark medication as given
router.post('/mark-given', authenticateToken, authorizeRoles('admin', 'staff', 'volunteer'), markMedicationAsGiven);

// Update medication
router.put('/:id', authenticateToken, authorizeRoles('admin', 'staff'), updateMedication);

// Delete medication
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteMedication);

module.exports = router;
