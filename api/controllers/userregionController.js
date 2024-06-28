/* eslint-disable */
const UserRegion = require('../models/userregion');
const UserGame  = require('../models/usergame.js');
const Territory = require('../models/territory');
const User  = require('../models/user.js');
const Lobby = require('../models/lobby');

const asignarTerritorioConUnidad = async (lobbyId, userId, territoryId, unityCount) => {
    try {
        const userExists = await User.findOne({ where: { id: userId } });
        if (!userExists) {
            throw new Error(`User with ID ${userId} does not exist`);
        }
        await UserRegion.create({
            lobbyId,
            userId,
            unity_count: unityCount,
            territoryId
        });
    } catch (error) {
        console.error('Error al asignar territorio con unidad:', error);
        throw error; 
    }
};

async function attackTerritory(ctx) {
    try {
        const { lobbyId } = ctx.params;
        const { attackerId, attackerTerritoryId, defensorId, defensorTerritoryId, diceResults } = ctx.request.body;
        console.log(ctx.request.body)
        console.log(`Params received: lobbyId=${lobbyId}, attackerId=${attackerId}, attackerTerritoryId=${attackerTerritoryId}, defensorId=${defensorId}, defensorTerritoryId=${defensorTerritoryId}`);

        const attackerRegion = await UserRegion.findOne({ where: { lobbyId, userId: attackerId, territoryId: attackerTerritoryId } });
        const defensorRegion = await UserRegion.findOne({ where: { lobbyId, userId: defensorId, territoryId: defensorTerritoryId } });

        console.log('Attacker Region:', attackerRegion);
        console.log('Defensor Region:', defensorRegion);

        if (!attackerRegion || !defensorRegion) {
            ctx.status = 404;
            ctx.body = { error: 'Territorio no encontrado' };
            console.log('Territorio no encontrado');
            return;
        }

        const neighbors = await Territory.findAll({ where: { TerritoryId: defensorTerritoryId, neighborId: attackerTerritoryId } });

        console.log('Neighbors:', neighbors);

        if (!neighbors) {
            ctx.status = 400;
            ctx.body = { error: 'Territorios no son vecinos' };
            console.log('Territorios no son vecinos');
            return;
        }

        let attackerDiceList = diceResults.sort((a, b) => b - a); 
        let defensorDiceList = [];
        let defensorDiceCount = defensorRegion.unity_count > 1 ? 2 : 1;

        for (let i = 0; i < defensorDiceCount; i++) {
            defensorDiceList.push(Math.floor(Math.random() * 6) + 1);
        }

        defensorDiceList.sort((a, b) => b - a); 

        console.log('Attacker Dice List:', attackerDiceList);
        console.log('Defensor Dice List:', defensorDiceList);

        let battlesWon = 0;
        let battlesLost = 0;

        for (let i = 0; i < defensorDiceList.length; i++) {
            if (attackerDiceList[i] > defensorDiceList[i]) {
                defensorRegion.unity_count -= 1;
                battlesWon += 1;
                console.log(`Battle ${i + 1}: Attacker wins`);
                if (defensorRegion.unity_count == 0) {
                    defensorRegion.userId = attackerId;
                    defensorRegion.unity_count = 1;
                    attackerRegion.unity_count -= 1;
                    console.log('Defensor territory captured');
                    break;
                }
            } else {
                attackerRegion.unity_count -= 1;
                battlesLost += 1;
                console.log(`Battle ${i + 1}: Attacker loses`);
            }

            if (attackerRegion.unity_count < 1) {
                console.log('Attacker has no more units to continue attacking');
                break;
            }
        }

        await attackerRegion.save();
        await defensorRegion.save();

        ctx.status = 200;
        ctx.body = {
            message: 'Territorio atacado con éxito',
            battlesWon: battlesWon,
            battlesLost: battlesLost
        };

    } catch (error) {
        console.error('Error al atacar territorio:', error);
        ctx.status = 500;
    }
}

async function moveUnits(ctx) {
    try {
        const { lobbyId } = ctx.params;
        const {userId, originTerritoryId, destinationTerritoryId, unit_count } = ctx.request.body;
        
        const neighbors = await Territory.findAll({ where: { TerritoryId: originTerritoryId, neighborId: destinationTerritoryId } });

        if (!neighbors) {
            ctx.status = 400;
            ctx.body = { error: 'No son vecinos' };
            return;
        }

        const originRegion = await UserRegion.findOne({ where: { lobbyId, userId, territoryId: originTerritoryId } });
        const destinationRegion = await UserRegion.findOne({ where: { lobbyId, userId, territoryId: destinationTerritoryId } });

        if (!originRegion || !destinationRegion) {
            ctx.status = 404;
            ctx.body = { error: 'El usuario no corresponde a estos territorios' };
            return;
        }

        if (unit_count > originRegion.unity_count - 1) {
            ctx.status = 400;
            ctx.body = { error: 'No puedes mover esta cantidad de tropas' };
            return;
        }

        if (unit_count <= 0) {
            ctx.status = 400;
            ctx.body = { error: 'No puedes mover esta cantidad de tropas' };
            return;
        }

        originRegion.unity_count -= unit_count;
        destinationRegion.unity_count += unit_count;
        originRegion.save();
        destinationRegion.save();
        

        ctx.status = 200;
        ctx.body = { message: 'Unidades movidas con éxito' };
    }
    catch(error){
        console.error('Error al mover unidades:', error);
        ctx.status = 500;
    }
}

async function reforzeTerritory(ctx) {
    try {
        const { lobbyId } = ctx.params;
        const { userId, territoryId, unit_count } = ctx.request.body;
        const lobby = await Lobby.findOne({ where: { id: lobbyId } });
        const user = await UserGame.findOne({ where: { lobbyId, userId } });
        const originRegion = await UserRegion.findOne({ where: { lobbyId, userId, territoryId } });
        /*if(lobby.actualTurn == user.turn){*/
        if (!originRegion) {
            ctx.status = 404;
            ctx.body = { error: 'Territorio no encontrado' };
            return;
        }

        if (unit_count > user.unity_inventary) {
            ctx.status = 400;
            ctx.body = { error: 'No tienes tantas tropas' };
            return;
        }

        if (unit_count < 1) {
            ctx.status = 400;
            ctx.body = { error: 'No puedes reforzar con menos de una unidad' };
            return;
        }

        originRegion.unity_count += unit_count;
        user.unity_inventary -= unit_count;
        user.unity_count += unit_count;
        user.save();
        originRegion.save();
        ctx.body = { message: 'Territorio reforzado con éxito', unityCount: originRegion.unity_count, 
        territoryId: originRegion.territoryId, inventory: user.unity_inventary }
        ctx.status = 200;
    }

    catch(error){
        console.error('Error al reforzar territorios:', error);
        ctx.status = 500;
    }
}

module.exports = { 
    asignarTerritorioConUnidad,
    attackTerritory,
    moveUnits,
    reforzeTerritory
 };
