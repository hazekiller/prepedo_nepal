const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Story = sequelize.define('Story', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false },
  location: { type: DataTypes.STRING(100) },
  summary: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT, allowNull: false },
  featured_image: { type: DataTypes.STRING(500) },
  image_alt: { type: DataTypes.TEXT },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_published: { type: DataTypes.BOOLEAN, defaultValue: false },
  published_at: { type: DataTypes.DATE },
  created_by: { type: DataTypes.INTEGER },
}, {
  tableName: 'stories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Story;