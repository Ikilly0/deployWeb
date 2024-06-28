const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');

const Territory = sequelize.define('Territory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Territory.hasMany(Territory, { as: 'Neighbors', foreignKey: 'neighborId' });

module.exports = Territory;