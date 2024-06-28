const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');
const User = require('./user');

const Lobby = sequelize.define('Lobby', {
    type: {
      type: DataTypes.BOOLEAN,
      allowNull: false 
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cantityPlayers: {
      type: DataTypes.INTEGER,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    host_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actualTurn: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  });
  
Lobby.belongsTo(User, { foreignKey: 'host_id' });

module.exports = Lobby;
