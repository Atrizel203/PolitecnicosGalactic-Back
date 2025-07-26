const { User, Score, sequelize } = require('../models');

// POST /api/scores
exports.saveScore = async (req, res) => {
  // ... (código existente de saveScore, no necesita cambios)
  const { puntuacion, tiempo_jugado } = req.body;
  const usuario_id = req.user.id;

  if (typeof puntuacion !== 'number' || puntuacion < 0) {
    return res.status(400).json({ success: false, message: 'La puntuación debe ser un número válido.' });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      const monedasGanadas = Math.floor(puntuacion / 100);
      await User.increment({ monedas: monedasGanadas }, { where: { id: usuario_id }, transaction: t });
      const newScore = await Score.create({ usuario_id, puntuacion, tiempo_jugado: tiempo_jugado || 0 }, { transaction: t });
      return { puntuacionGuardada: newScore.puntuacion, monedasGanadas: monedasGanadas };
    });
    res.status(201).json({ success: true, message: 'Puntuación guardada y recompensas otorgadas.', data: result });
  } catch (error) {
    console.error("ERROR AL GUARDAR PUNTUACIÓN:", error);
    res.status(500).json({ success: false, message: 'Error interno al guardar la puntuación', error: error.message });
  }
};

// GET /api/scores/leaderboard o /api/scores/leaderboard/:limit
exports.getLeaderboard = async (req, res) => {
  // ... (código existente de getLeaderboard, no necesita cambios)
  const limit = parseInt(req.params.limit, 10) || 20;
  try {
    const leaderboard = await Score.findAll({
      attributes: [ 'usuario_id', [sequelize.fn('MAX', sequelize.col('puntuacion')), 'max_puntuacion'] ],
      include: [{ model: User, attributes: ['username'] }],
      group: ['usuario_id', 'Usuario.id'],
      order: [[sequelize.literal('max_puntuacion'), 'DESC']],
      limit: limit,
      raw: true,
      nest: true
    });

    const formattedLeaderboard = leaderboard.map(entry => ({
        puntuacion: entry.max_puntuacion,
        usuario: { id: entry.usuario_id, username: entry.Usuario.username }
    }));
    res.json({ success: true, data: formattedLeaderboard });
  } catch (error) {
    console.error("ERROR AL OBTENER LEADERBOARD:", error);
    res.status(500).json({ success: false, message: 'Error al obtener el leaderboard', error: error.message });
  }
};

// --- ¡AÑADE ESTA FUNCIÓN FALTANTE! ---
// GET /api/scores/user/:userId
exports.getUserScores = async (req, res) => {
  try {
    const { userId } = req.params;
    const scores = await Score.findAll({
      where: { usuario_id: userId },
      order: [['fecha_partida', 'DESC']],
      // Opcional: limitar el número de partidas a devolver
      // limit: 50 
    });

    if (!scores) {
      return res.status(404).json({ success: false, message: 'No se encontraron puntuaciones para este usuario.' });
    }

    res.json({ success: true, data: scores });
  } catch (error) {
    console.error("ERROR AL OBTENER PUNTUACIONES DE USUARIO:", error);
    res.status(500).json({ success: false, message: 'Error al obtener las puntuaciones del usuario.', error: error.message });
  }
};