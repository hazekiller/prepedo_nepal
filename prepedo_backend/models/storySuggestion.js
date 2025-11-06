const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StorySuggestion = sequelize.define('StorySuggestion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  location: { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
  submitted_by_name: { type: DataTypes.STRING(100) },
  submitted_by_email: { type: DataTypes.STRING(100) },
  status: { type: DataTypes.ENUM('pending','reviewing','approved','rejected'), defaultValue: 'pending' },
  admin_notes: { type: DataTypes.TEXT },
}, {
  tableName: 'story_suggestions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = StorySuggestion;