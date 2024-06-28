const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');

const Infantry = sequelize.define('Infantry', {
    name: DataTypes.STRING,
    size: DataTypes.INTEGER,
});

const Cavalry = sequelize.define('Cavalry', {
    name: DataTypes.STRING,
    size: DataTypes.INTEGER,
});

const Artillery = sequelize.define('Artillery', {
    name: DataTypes.STRING,
    size: DataTypes.INTEGER,
});

module.exports = { Infantry, Cavalry, Artillery };
