const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Initiative = sequelize.define('Initiative', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  logo_url: { type: DataTypes.STRING(500) },
  description: { type: DataTypes.TEXT },
  website: { type: DataTypes.STRING(255) },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'initiatives',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Initiative;