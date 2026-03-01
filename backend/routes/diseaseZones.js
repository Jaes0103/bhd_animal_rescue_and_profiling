const express = require('express');
const router = express.Router();
const {
  getDiseaseZones,
  getDiseaseZone,
  createDiseaseZone,
  updateDiseaseZone,
  deleteDiseaseZone
} = require('../controllers/diseaseZonesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all disease zones
router.get('/', getDiseaseZones);

// Get single disease zone
router.get('/:id', getDiseaseZone);

// Create disease zone (staff and admin only)
router.post('/', authorizeRoles('admin', 'staff'), createDiseaseZone);

// Update disease zone (staff and admin only)
router.put('/:id', authorizeRoles('admin', 'staff'), updateDiseaseZone);

// Delete disease zone (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteDiseaseZone);

module.exports = router;
