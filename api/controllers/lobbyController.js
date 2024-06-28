const Lobby = require('../models/lobby');
const UserLobby = require('../models/userlobby');
const UserGame  = require('../models/usergame');
const { use } = require('../router');

async function createLobby(ctx) {
    console.log('Crear Lobby');
    console.log(ctx.request.body);
    try {
        const {name ,host_id, type, password } = ctx.request.body;
        let state = 'waiting';
        const lobby = await Lobby.create({ type, name ,state, host_id, password, actualTurn: 0});
        let userState = 'no listo';
        const userLobby = await UserLobby.create({ lobbyId: lobby.id, userId: host_id, userState: userState});
        userLobby.save();
        lobby.actualTurn = 0;
        lobby.cantityPlayers = 1;
        lobby.save();
        ctx.status = 201;
        ctx.body = lobby;
        console.log('Lobby creada:', lobby);
    } catch (error) {
        console.error('Error al crear la lobby:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al crear la lobby' };
    }
}

async function getLobbys(ctx) {
    console.log('Obtener Lobbies');
    try {
        const lobbies = await Lobby.findAll();
        ctx.status = 200;
        ctx.body = lobbies;
        console.log('Lobbies:', lobbies);
    } catch (error) {
        console.error('Error al obtener lobbies:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al obtener lobbies' };
    }
}

async function getLobby(ctx) {
    console.log('Obtener Lobby');
    try {
        const lobby = await Lobby.findOne({ where: { id: ctx.params.lobbyId } });
        if (!lobby) {
            ctx.status = 404;
            ctx.body = { error: 'Lobby no encontrada' };
            return;
        }
        ctx.status = 200;
        ctx.body = lobby;
        console.log('Lobby:', lobby);
    } catch (error) {
        console.error('Error al obtener lobby:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al obtener lobby' };
    }
}

// desde el front con getLobbies, sabemos cuales estan en state = 'playing' y cuales en state = 'waiting'
// entonces desde ahi gestionamos si se puede unir o no a un lobby

async function addUser(ctx) {
    console.log('Agregar usuario a lobby');
    console.log(ctx.params);
    console.log(ctx.request.body);
    try {
        const { lobbyId } = ctx.params;
        const { userId, password } = ctx.request.body;
        const lobby = await Lobby.findOne({ where: { id: lobbyId } });

        if (!lobby) {
            ctx.status = 404;
            ctx.body = { error: 'Lobby no encontrada' };
            return;
        }

        if ((lobby.password !== password && lobby.type == true) || lobby.state == 'playing') {
            ctx.status = 401;
            ctx.body = { error: 'No se pudo unir a la lobby' };
            return;
        }

        const existingUserLobby = await UserLobby.findOne({ where: { lobbyId, userId } });

        if (existingUserLobby) {
            ctx.status = 409;
            ctx.body = { error: 'El usuario ya está en el lobby' };
            return;
        }

        const userState = 'no listo';
        const userLobby = await UserLobby.create({ lobbyId, userId, userState });
        lobby.cantityPlayers++;
        await lobby.save();
        await userLobby.save();

        ctx.status = 201;
        ctx.body = userLobby;
        console.log('Usuario agregado a lobby:', userLobby);

    } catch (error) {
        console.error('Error al agregar usuario a lobby:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al agregar usuario a lobby' };
    }
}

async function removeUser(ctx) {
    console.log('Eliminar usuario de lobby');
    console.log(ctx.request.body);
    try {
        const { lobbyId: lobbyId, userId: userId } = ctx.params;
        const userLobby = await UserLobby.findOne({ where: { lobbyId, userId } });
        if (!userLobby) {
            ctx.status = 404;
            ctx.body = { error: 'Usuario no encontrado en lobby' };
            return;
        }
        const lobby = await Lobby.findOne({ where: { id: lobbyId } });
        lobby.cantityPlayers--;
        await userLobby.destroy();
        ctx.status = 204;
        console.log('Usuario eliminado de lobby:', userLobby);

    } catch (error) {
        console.error('Error al eliminar usuario de lobby:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al eliminar usuario de lobby' };
    }
}

async function getUsers(ctx) {
    console.log('Obtener usuarios de lobby');
    console.log(ctx.params);
    try {
        const { lobbyId: lobbyId } = ctx.params;
        const users = await UserLobby.findAll({ where: { lobbyId } });
        ctx.status = 200;
        ctx.body = users;
        console.log('Usuarios de lobby:', users);
    } catch (error) {
        console.error('Error al obtener usuarios de lobby:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al obtener usuarios de lobby' };
    }
}

async function changeUserState(ctx) {
    console.log('Jugador listo');
    console.log(ctx.request.body);
    try {
        const { lobbyId: lobbyId, userId: userId } = ctx.params;
        const { state } = ctx.request.body;
        const userLobby = await UserLobby.findOne({ where: { lobbyId, userId } });
        if (!userLobby) {
            ctx.status = 404;
            ctx.body = { error: 'Usuario no encontrado en lobby' };
            return;
        }
        userLobby.userState = state;
        await userLobby.save();
        ctx.status = 200;
        ctx.body = userLobby;
        console.log('Jugador listo:', userLobby);
    } catch (error) {
        console.error('Error al marcar jugador como listo:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al marcar jugador como listo' };
    }
}

async function startGame(ctx) {
    console.log('Iniciar juego');
    console.log(ctx.request.body);
    try {
        const lobbyId = ctx.params.lobbyId;
        const lobby = await Lobby.findOne({ where: { id: lobbyId } });
        if (!lobby) {
            ctx.status = 404;
            ctx.body = { error: 'Lobby no encontrada' };
            return;
        }
        let usersCount = 0;
        let usersReadyCount = 0;
        const users = await UserLobby.findAll({ where: { lobbyId } });
        users.forEach(user => {
            usersCount++;
            if (user.userState == 'listo') {
                usersReadyCount++;
            }
        });

        if (usersCount==usersReadyCount && usersCount>1) {
            if(lobby.state != 'playing'){
            lobby.state = 'playing';
            await lobby.save();
            let turn = 0;
            users.forEach(async user => {
                const userGame = await UserGame.create({ userId: user.userId, lobbyId: user.lobbyId, turn: turn});
                userGame.cards_count = 0;
                userGame.turn = turn;
                userGame.save();
                turn++;
            });
            ctx.status = 200;
            ctx.body = lobby;
            console.log('Juego iniciado:', lobby);}
        }
        else {
            ctx.status = 400;
            ctx.body = { 
                error: 'No se puede iniciar el juego, hay jugadores no listos o hay menos de 2 jugadores' 
            };
        }

    } catch (error) {
        console.error('Error al iniciar juego:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al iniciar juego' };
    }
}

module.exports = {
    createLobby,
    getLobbys,
    getLobby,
    addUser,
    removeUser,
    getUsers,
    changeUserState,
    startGame
};

