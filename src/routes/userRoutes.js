const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, userController.getProfile);
// Ruta para gastar monedas
router.post('/spend-coins', protect, userController.spendCoins);
module.exports = router;