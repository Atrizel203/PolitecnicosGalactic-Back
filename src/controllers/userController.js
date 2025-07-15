const { User, Score } = require('../models');
const { Sequelize } = require('sequelize');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  const usuario_id = req.user.id;

  try {
    const user = await User.findByPk(usuario_id, {
      attributes: ['id', 'username', 'email', 'fecha_registro']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
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
        profile: user,
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