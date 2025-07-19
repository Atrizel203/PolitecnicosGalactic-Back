const { User, Score } = require('../models');
const { Sequelize } = require('sequelize');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  const usuario_id = req.user.id;
  // Tasa de recarga: Gana 1 segundo de juego por cada 10 segundos de tiempo real.
  // Puedes ajustar este valor fácilmente.
  const TASA_RECARGA_SEGUNDOS_REALES = 10;

  try {
    let user = await User.findByPk(usuario_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // --- Lógica de recarga pasiva de tiempo de juego ---
    if (user.tiempo_juego_disponible < user.tiempo_juego_maximo) {
      const ahora = new Date();
      const ultimaActualizacion = new Date(user.tiempo_juego_ultima_actualizacion);
      const segundosRealesPasados = Math.floor((ahora - ultimaActualizacion) / 1000);

      if (segundosRealesPasados > TASA_RECARGA_SEGUNDOS_REALES) {
        const tiempoJuegoRecargado = Math.floor(segundosRealesPasados / TASA_RECARGA_SEGUNDOS_REALES);

        // Calcula el nuevo tiempo, asegurando que no exceda el máximo
        const tiempoJuegoActualizado = Math.min(
          user.tiempo_juego_maximo,
          user.tiempo_juego_disponible + tiempoJuegoRecargado
        );

        // Si el tiempo ha cambiado, actualizamos la base de datos
        if (tiempoJuegoActualizado > user.tiempo_juego_disponible) {
          await user.update({
            tiempo_juego_disponible: tiempoJuegoActualizado,
            tiempo_juego_ultima_actualizacion: ahora
          });
        }
      }
    }

    const stats = await Score.findOne({
      where: { usuario_id },
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_partidas'],
        [Sequelize.fn('MAX', Sequelize.col('puntuacion')), 'mejor_puntuacion'],
        [Sequelize.fn('AVG', Sequelize.col('puntuacion')), 'promedio_puntuacion'],
        [Sequelize.fn('SUM', Sequelize.col('enemigos_destruidos')), 'total_enemigos_destruidos'],
        [Sequelize.fn('SUM', Sequelize.col('tiempo_jugado')), 'total_tiempo_jugado']
      ],
      raw: true
    });

    // Formatear promedio para que no tenga tantos decimales
    if (stats.promedio_puntuacion) {
      stats.promedio_puntuacion = parseFloat(stats.promedio_puntuacion).toFixed(0);
    }

    res.json({
      success: true,
      data: {
        profile: {
          id: user.id,
          username: user.username,
          email: user.email,
          fecha_registro: user.fecha_registro,
          monedas: user.monedas,
          tiempo_juego_disponible: user.tiempo_juego_disponible,
          tiempo_juego_maximo: user.tiempo_juego_maximo
        },
        stats: stats.total_partidas > 0 ? stats : {
          total_partidas: 0,
          mejor_puntuacion: 0,
          promedio_puntuacion: 0,
          total_enemigos_destruidos: 0,
          total_tiempo_jugado: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el perfil del usuario', error: error.message });
  }
};