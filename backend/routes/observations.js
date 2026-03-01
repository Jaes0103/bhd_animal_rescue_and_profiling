const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getObservations,
  getObservationById,
  createObservation,
  updateObservation,
  deleteObservation
} = require('../controllers/observationController');

// Get all observations (authenticated users)
router.get('/', authenticateToken, getObservations);

// Get single observation (authenticated users)
router.get('/:id', authenticateToken, getObservationById);

// Create observation (staff and admin only)
router.post('/', authenticateToken, authorizeRoles('admin', 'staff'), createObservation);

// Update observation (staff and admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin', 'staff'), updateObservation);

// Delete observation (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteObservation);

module.exports = router;
