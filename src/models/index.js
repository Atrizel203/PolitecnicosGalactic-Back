const User = require('./user.model');
const Score = require('./score.model');
const sequelize = require('../config/database'); // Importa la instancia de Sequelize

// Definir la relación: Un usuario puede tener muchas puntuaciones
User.hasMany(Score, { foreignKey: 'usuario_id' });
Score.belongsTo(User, { foreignKey: 'usuario_id' });

// Exportamos los modelos Y la instancia de sequelize
module.exports = { User, Score, sequelize };