const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');
const { Artillery, Cavalry, Infantry } = require('./unit');

const Card = sequelize.define('Card', {
  name: DataTypes.STRING,
});

Card.belongsTo(Infantry, { foreignKey: 'unitId', constraints: false });
Card.belongsTo(Cavalry, { foreignKey: 'unitId', constraints: false });
Card.belongsTo(Artillery, { foreignKey: 'unitId', constraints: false });

module.exports = Card;
