const express = require('express');
const router = express.Router();
const {
  getDonations,
  createDonation,
  getDonationStats
} = require('../controllers/donationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles('admin', 'volunteer'), getDonations);
router.post('/', authenticateToken, authorizeRoles('admin', 'volunteer'), createDonation);
router.get('/stats', authenticateToken, authorizeRoles('admin', 'volunteer'), getDonationStats);

module.exports = router;
