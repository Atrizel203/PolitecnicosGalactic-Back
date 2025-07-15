const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Score = sequelize.define('Puntuacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  puntuacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nivel_alcanzado: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  enemigos_destruidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tiempo_jugado: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fecha_partida: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'puntuaciones',
  timestamps: false
});

module.exports = Score;