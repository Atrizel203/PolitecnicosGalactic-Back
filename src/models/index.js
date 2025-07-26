const User = require('./user.model');
const Score = require('./score.model');
const sequelize = require('../config/database'); // Importa la instancia de Sequelize

User.hasMany(Score, { foreignKey: 'usuario_id' });
Score.belongsTo(User, { foreignKey: 'usuario_id' });

module.exports = { User, Score, sequelize };