const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Setting = sequelize.define('Setting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  setting_key: { type: DataTypes.STRING(100), allowNull: false },
  setting_value: { type: DataTypes.TEXT },
  setting_type: { type: DataTypes.ENUM('string','number','boolean','json'), defaultValue: 'string' },
  description: { type: DataTypes.TEXT },
}, {
  tableName: 'settings',
  timestamps: true,
  updatedAt: 'updated_at',
  createdAt: false,
});

module.exports = Setting;