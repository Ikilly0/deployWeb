const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');
const User = require('./user');
const Card = require('./card');
const Lobby = require('./lobby');
const Territory = require('./territory');

const UserGame = sequelize.define('UserGame', {
    lobbyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unity_inventary: DataTypes.INTEGER,
    unity_count: DataTypes.INTEGER,
    cards_count: DataTypes.INTEGER,
    territory_count: DataTypes.INTEGER,
    turn: DataTypes.INTEGER,
  });

UserGame.belongsTo(User, { foreignKey: 'userId' });
UserGame.belongsTo(Lobby, { foreignKey: 'lobbyId' });
UserGame.hasMany(Territory, { as: 'Territories', foreignKey: 'TerritoryId' });
UserGame.hasMany(Card, { as: 'Cards', foreignKey: 'CardId' });

module.exports = UserGame;
