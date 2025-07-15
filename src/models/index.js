const User = require('./user.model');
const Score = require('./score.model');

// Definir la relación: Un usuario puede tener muchas puntuaciones
User.hasMany(Score, { foreignKey: 'usuario_id' });
Score.belongsTo(User, { foreignKey: 'usuario_id' });

module.exports = { User, Score };