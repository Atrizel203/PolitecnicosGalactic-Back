const { Score, User } = require('../models');
const { Sequelize } = require('sequelize');

// POST /api/scores
exports.saveScore = async (req, res) => {
  const { puntuacion, nivel_alcanzado, enemigos_destruidos, tiempo_jugado } = req.body;
  const usuario_id = req.user.id;

  try {
    const result = await sequelize.transaction(async (t) => {
      // Obtener el usuario de forma segura dentro de la transacción
      const user = await User.findByPk(usuario_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!user) {
        // Esto no debería pasar si el token es válido, pero es una buena práctica
        return { status: 404, success: false, message: 'Usuario no encontrado.' };
      }

      // 1. Validar y deducir tiempo de juego
      if (user.tiempo_juego_disponible < tiempo_jugado) {
        return { status: 400, success: false, message: `No tienes suficiente tiempo de juego. Tienes ${user.tiempo_juego_disponible}s y la partida duró ${tiempo_jugado}s.` };
      }
      const nuevoTiempoDisponible = user.tiempo_juego_disponible - tiempo_jugado;

      // 2. Calcular y otorgar monedas (ej: 10% de la puntuación)
      const monedasGanadas = Math.floor(puntuacion * 0.10);
      const nuevasMonedas = user.monedas + monedasGanadas;
      
      // 3. Actualizar el usuario y guardar la nueva puntuación
      await user.update({
          monedas: nuevasMonedas,
          tiempo_juego_disponible: nuevoTiempoDisponible,
          tiempo_juego_ultima_actualizacion: new Date() // Actualizamos el timestamp
      }, { transaction: t });
        
      await Score.create({
          usuario_id,
          puntuacion,
          nivel_alcanzado,
          enemigos_destruidos,
          tiempo_jugado
      }, { transaction: t });

      return {
        status: 201,
        success: true,
        message: 'Puntuación guardada y recompensas otorgadas.',
        data: {
            puntuacionGuardada: puntuacion,
            monedasGanadas: monedasGanadas,
            tiempoRestante: nuevoTiempoDisponible
        }
      };
    });

    res.status(result.status).json(result);

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