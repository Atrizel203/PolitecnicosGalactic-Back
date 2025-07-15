const { Score, User } = require('../models');
const { Sequelize } = require('sequelize');

// POST /api/scores
exports.saveScore = async (req, res) => {
  const { puntuacion, nivel_alcanzado, enemigos_destruidos, tiempo_jugado } = req.body;
  const usuario_id = req.user.id;

  try {
    const highestScore = await Score.findOne({
      where: { usuario_id },
      order: [['puntuacion', 'DESC']]
    });

    if (highestScore && puntuacion <= highestScore.puntuacion) {
      return res.status(200).json({
        success: true,
        message: 'La nueva puntuación no es más alta que la mejor registrada. No se guardó.',
        data: { saved: false }
      });
    }
    
    const newScore = await Score.create({
      usuario_id,
      puntuacion,
      nivel_alcanzado,
      enemigos_destruidos,
      tiempo_jugado
    });

    res.status(201).json({
      success: true,
      message: 'Puntuación guardada exitosamente.',
      data: { saved: true, score: newScore }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar la puntuación', error: error.message });
  }
};

// GET /api/scores/user/:userId
exports.getUserScores = async (req, res) => {
  try {
    const scores = await Score.findAll({
      where: { usuario_id: req.params.userId },
      order: [['fecha_partida', 'DESC']]
    });
    res.json({ success: true, data: scores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener puntuaciones', error: error.message });
  }
};

// GET /api/scores/leaderboard o /api/scores/leaderboard/:limit
exports.getLeaderboard = async (req, res) => {
  const limit = parseInt(req.params.limit, 10) || 10;

  try {
    const leaderboard = await Score.findAll({
      attributes: [
        'usuario_id',
        [Sequelize.fn('MAX', Sequelize.col('puntuacion')), 'max_puntuacion'],
      ],
      include: [{
        model: User,
        attributes: ['username']
      }],
      group: ['usuario_id', 'Usuario.id'],
      order: [[Sequelize.literal('max_puntuacion'), 'DESC']],
      limit: limit,
      raw: true, // Optimiza el resultado
      nest: true
    });

    // Remapear el resultado para que sea más limpio
    const formattedLeaderboard = leaderboard.map(entry => ({
        puntuacion: entry.max_puntuacion,
        usuario: {
            id: entry.usuario_id,
            username: entry.Usuario.username
        }
    }));

    res.json({ success: true, data: formattedLeaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el leaderboard', error: error.message });
  }
};