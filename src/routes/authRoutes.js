const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerRules, loginRules, handleValidationErrors } = require('../utils/validators');

router.post('/register', registerRules(), handleValidationErrors, authController.register);
router.post('/login', loginRules(), handleValidationErrors, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/verify', protect, authController.verifyToken);

module.exports = router;