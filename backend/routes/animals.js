const express = require('express');
const router = express.Router();
const {
  getAllAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  addAnimalPhoto,
  updateAnimalStatus,
  getAnimalsNeedingAttention
} = require('../controllers/animalController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', getAllAnimals);
router.get('/needing-attention', authenticateToken, authorizeRoles('admin', 'staff'), getAnimalsNeedingAttention);
router.get('/:id', getAnimalById);
router.post('/', authenticateToken, authorizeRoles('admin', 'volunteer', 'staff'), createAnimal);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'volunteer', 'staff'), updateAnimal);
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'staff'), updateAnimalStatus);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteAnimal);
router.post('/photos', authenticateToken, authorizeRoles('admin', 'volunteer', 'staff'), addAnimalPhoto);

module.exports = router;
