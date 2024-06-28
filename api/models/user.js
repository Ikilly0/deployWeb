const sequelize = require('./sequelize.js');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  nickname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_logged: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
});

User.hasMany(User, { foreignKey: 'FriendUserId', constraints: false });

module.exports = User;
