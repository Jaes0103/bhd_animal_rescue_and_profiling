const express = require('express');
const router = express.Router();
const {
  getRescueMarkers,
  getRescueMarker,
  createRescueMarker,
  updateRescueMarker,
  deleteRescueMarker
} = require('../controllers/rescueMarkersController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all rescue markers
router.get('/', getRescueMarkers);

// Get single rescue marker
router.get('/:id', getRescueMarker);

// Create rescue marker (volunteer and admin only)
router.post('/', authorizeRoles('admin', 'volunteer'), createRescueMarker);

// Update rescue marker (volunteer and admin only)
router.put('/:id', authorizeRoles('admin', 'volunteer'), updateRescueMarker);

// Delete rescue marker (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteRescueMarker);

module.exports = router;
