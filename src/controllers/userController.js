const { User, Score } = require('../models');
const { Sequelize } = require('sequelize');

exports.getProfile = async (req, res) => {
  const usuario_id = req.user.id;

  try {
    // 1. Obtener el perfil del usuario
    const user = await User.findByPk(usuario_id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // 2. Obtener las estadísticas de juego del usuario
    const stats = await Score.findOne({
      where: { usuario_id },
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_partidas'],
        [Sequelize.fn('MAX', Sequelize.col('puntuacion')), 'mejor_puntuacion'],
        [Sequelize.fn('AVG', Sequelize.col('puntuacion')), 'promedio_puntuacion']
      ],
      raw: true
    });
    
    // Formatear el promedio para que no tenga decimales
    if (stats && stats.promedio_puntuacion) {
        stats.promedio_puntuacion = parseFloat(stats.promedio_puntuacion).toFixed(0);
    }

    res.json({
      success: true,
      data: {
        profile: user,
        stats: stats && stats.total_partidas ? stats : { total_partidas: 0, mejor_puntuacion: 0, promedio_puntuacion: "0" }
      }
    });
  } catch (error) {
    console.error("Error en getProfile:", error);
    res.status(500).json({ success: false, message: 'Error al obtener el perfil del usuario', error: error.message });
  }
};

// POST /api/user/spend-coins
exports.spendCoins = async (req, res) => {
  const { amount } = req.body; 
  const usuario_id = req.user.id;

  // 1. Validar la entrada
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ success: false, message: 'La cantidad debe ser un número positivo.' });
  }

  try {
    const user = await User.findByPk(usuario_id);

    // 2. Verificar si el usuario tiene suficientes monedas
    if (user.monedas < amount) {
      return res.status(400).json({ success: false, message: 'No tienes suficientes monedas.' });
    }

    // 3. Deducir las monedas. `decrement` es una forma segura que previene race conditions.
    await user.decrement('monedas', { by: amount });

    // 4. Enviar la respuesta con el nuevo total de monedas
    res.json({
      success: true,
      message: 'Compra realizada con éxito.',
      data: {
        monedasRestantes: user.monedas - amount 
      }
    });

  } catch (error) {
    console.error("ERROR AL GASTAR MONEDAS:", error);
    res.status(500).json({ success: false, message: 'Error interno al procesar la transacción.' });
  }
};