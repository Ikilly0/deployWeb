const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('web', 'prouser', 'admin1214', {
  host: 'localhost',
  dialect: 'postgres'
});

module.exports = sequelize;
