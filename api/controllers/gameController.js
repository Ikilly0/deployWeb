const Lobby = require('../models/lobby');
const UserGame  = require('../models/usergame');
const { get } = require('../router');

async function getActualTurn(ctx){
    try {
        const { lobbyId } = ctx.params;
        const lobby = await Lobby.findOne({ where: { id: lobbyId } });
        const user = await UserGame.findOne({ where: { turn: lobby.actualTurn } });
        ctx.status = 200;
        ctx.body = user;
        console.log('Turno actual:', user.id);
    } catch (error) {
        console.error('Error al obtener el turno actual:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al obtener el turno actual' };
    }
}

async function passTurn(ctx){
    try {
        const { lobbyId } = ctx.params;
        const lobby = await Lobby.findOne({ where: { id: lobbyId } });
        let actualTurn = lobby.actualTurn;
        actualTurn = (actualTurn + 1) % lobby.lenght;
        lobby.actualTurn = actualTurn;
        await lobby.save();
        ctx.status = 200;
        ctx.body = { message: 'Turno pasado con éxito' };
        console.log('Turno pasado con éxito');
    } catch (error) {
        console.error('Error al pasar el turno:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al pasar el turno' };
    }
}

async function getMyGames(ctx){
    try {
        const { userId } = ctx.params;
        const userGames = await UserGame.findAll({ where: { userId } });
        ctx.status = 200;
        ctx.body = userGames;
        console.log('Juegos del usuario:', userGames);
    } catch (error) {
        console.error('Error al obtener los juegos del usuario:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al obtener los juegos del usuario' };
    }
}   

module.exports = {
    getActualTurn,
    passTurn,
    getMyGames
};