const express = require('express');
const router = express.Router();
const {
  getApplications,
  createApplication,
  reviewApplication,
  getAdoptions,
  createAdoption
} = require('../controllers/adoptionController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/applications', authenticateToken, authorizeRoles('admin', 'volunteer'), getApplications);
router.post('/applications', createApplication);
router.put('/applications/:id/review', authenticateToken, authorizeRoles('admin', 'volunteer'), reviewApplication);
router.get('/', authenticateToken, authorizeRoles('admin', 'volunteer'), getAdoptions);
router.post('/', authenticateToken, authorizeRoles('admin', 'volunteer'), createAdoption);

module.exports = router;
