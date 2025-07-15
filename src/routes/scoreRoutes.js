const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');
const { scoreRules, handleValidationErrors } = require('../utils/validators');

router.post('/', protect, scoreRules(), handleValidationErrors, scoreController.saveScore);
router.get('/user/:userId', scoreController.getUserScores); // Ruta pública para ver puntuaciones de otros
router.get('/leaderboard/:limit', scoreController.getLeaderboard);
router.get('/leaderboard', scoreController.getLeaderboard);

module.exports = router;