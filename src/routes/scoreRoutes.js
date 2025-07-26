const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');
// Eliminamos la validación de scoreRules por ahora para simplificar,
// ya que la validación principal está en el controlador.
// const { scoreRules, handleValidationErrors } = require('../utils/validators');

// Guardar una nueva puntuación (ruta protegida)
router.post('/', protect, scoreController.saveScore);

// Obtener todas las puntuaciones de un usuario específico (ruta pública)
router.get('/user/:userId', scoreController.getUserScores);

// Obtener el leaderboard (ruta pública, con límite opcional)
router.get('/leaderboard/:limit', scoreController.getLeaderboard);
router.get('/leaderboard', scoreController.getLeaderboard);

module.exports = router;