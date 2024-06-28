/* eslint-disable */
const TerritoryNeighbor = sequelize.define('TerritoryNeighbor', {
    territoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Territory,
        key: 'id'
      }
    },
    neighborId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Territory,
        key: 'id'
      }
    }
  });
  
  Territory.belongsToMany(Territory, { through: TerritoryNeighbor, as: 'Neighbors', foreignKey: 'territoryId', otherKey: 'neighborId' });

  module.exports = TerritoryNeighbor;