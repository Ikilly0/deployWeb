const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');
const User = require('./user');
const Lobby = require('./lobby');

const UserRegion = sequelize.define('UserRegion', {
  lobbyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unity_count: DataTypes.INTEGER,
  territoryId: DataTypes.INTEGER,
});

UserRegion.belongsTo(User, { foreignKey: 'userId' });
UserRegion.belongsTo(Lobby, { foreignKey: 'lobbyId' });


module.exports = UserRegion;