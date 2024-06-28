const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');
const User = require('./user');
const Lobby = require('./lobby');

const UserLobby = sequelize.define('UserLobby', {
  lobbyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userState:{
    type: DataTypes.STRING
  }
});

UserLobby.belongsTo(User, { foreignKey: 'userId' });
UserLobby.belongsTo(Lobby, { foreignKey: 'lobbyId' });

module.exports = UserLobby;