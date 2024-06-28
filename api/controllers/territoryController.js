const fs = require('fs');
const Territory = require('../models/territory');
const UserGame  = require('../models/usergame.js');
const { asignarTerritorioConUnidad } = require('./userregionController.js');
const UserRegion = require('../models/userregion.js');
const regionsData = fs.readFileSync('./api/data/regions.json', 'utf8'); 
const territoriesData = JSON.parse(regionsData);


  

async function createTerritories(ctx) {
  try {
      const territories = {};
      for (const idStr in territoriesData) {
          const id = parseInt(idStr);
          territories[id] = await Territory.create({ id });
      }

      for (const idStr in territoriesData) {
          const id = parseInt(idStr);
          const neighborsIds = territoriesData[idStr];
          const territory = territories[id];

          console.log(`Territorio ID: ${territory.id}`);
          console.log(`Vecinos del Territorio ${territory.id}: ${neighborsIds.join(', ')}`);

          for (const neighborId of neighborsIds) {
              const neighborTerritory = territories[neighborId];
              await territory.addNeighbor(neighborTerritory);
          }
      }

      ctx.status = 200;
      ctx.body = { message: 'Territorios creados exitosamente' };
  } catch (error) {
      console.error('Error al crear territorios:', error);
      ctx.status = 500;
      ctx.body = { error: 'Error al crear territorios' };
  }
}

  async function randomizeTerritories(ctx) {
    try {
        const { lobbyId } = ctx.params;
        const users = await UserGame.findAll({ where: { lobbyId } });
        const territories = await Territory.findAll();

        const totalTerritories = territories.length;
        const totalUsers = users.length;

        const baseTerritoriesPerUser = Math.floor(totalTerritories / totalUsers);

        let territoriesAssigned = 0;
        for (let i = 0; i < totalUsers; i++) {
            const user = users[i];
            user.unity_inventary = baseTerritoriesPerUser * 2;
            user.unity_count = baseTerritoriesPerUser;
            user.territory_count = baseTerritoriesPerUser;
            await user.save();
            const territoriesForUser = territories.slice(territoriesAssigned, territoriesAssigned + baseTerritoriesPerUser);
            territoriesAssigned += baseTerritoriesPerUser;

            for (const territory of territoriesForUser) {
                await asignarTerritorioConUnidad(lobbyId, user.userId, territory.id, 1);
            }
        }

        let remainingTerritories = territories.slice(territoriesAssigned);
        let userIndex = 0;
        while (remainingTerritories.length > 0) {
            const user = users[userIndex];
            user.unity_count += 1;
            user.territory_count += 1;
            await user.save();
            const territory = remainingTerritories.pop();
            await asignarTerritorioConUnidad(lobbyId, user.userId, territory.id, 1);
            userIndex = (userIndex + 1) % totalUsers;
        }

        ctx.status = 200;
        ctx.body = { message: users };
    } catch (error) {
        console.error('Error al Repartir territorios del juego:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al Repartir territorios del juego' };
    } 
  }
async function getMap(ctx) {
  try {
      const { lobbyId } = ctx.params;
      const userRegions = await UserRegion.findAll({ where: { lobbyId } });
      const userGame = await UserGame.findAll({ where: { lobbyId } });

      const territoryInfo = userRegions.map(userRegion => {
          return {
              userId: userRegion.userId,
              territoryId: userRegion.territoryId,
              unityCount: userRegion.unity_count
          };
      });

      const inventoryInfo = userGame.map(userGame => {
        return {
            userId: userGame.userId,
            lobbyId: userGame.lobbyId,
            unityCount: userGame.unity_count,
            cards: userGame.cards_count,
            inventory: userGame.unity_inventary,
            territoryCount: userGame.territory_count,
            turn: userGame.turn
        };
      }
      )

      ctx.status = 200;
      ctx.body = {map: territoryInfo, inventoryInfo: inventoryInfo};
  } catch (error) {
      console.error('Error al obtener territorios:', error);
      ctx.status = 500;
      ctx.body = { error: 'Error al obtener territorios' };
  }
}

  
module.exports = {
    createTerritories,
    randomizeTerritories,
    getMap
};