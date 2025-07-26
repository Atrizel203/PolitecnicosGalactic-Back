const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, scoreController.saveScore);
router.get('/user/:userId', scoreController.getUserScores);
router.get('/leaderboard/:limit', scoreController.getLeaderboard);
router.get('/leaderboard', scoreController.getLeaderboard);

module.exports = router;