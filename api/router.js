const Router = require('koa-router');
const router = new Router();
const userController = require('./controllers/userController');
const lobbyController = require('./controllers/lobbyController');
const territoryController = require('./controllers/territoryController');
const userRegionController = require('./controllers/userregionController');
const userGameController = require('./controllers/gameController');



// Rutas!

router.post('/users', userController.createUser);
router.post('/territories', territoryController.createTerritories)
router.patch('/users/:email', userController.closeUserSession); // Cerrar sesión con email en params
router.post('/users/:email', userController.logginUser); // Iniciar sesión con email en params, password en body

router.get('/protected', async (ctx) => {
    const { id, email } = ctx.state.user;
});

// Rutas de lobby!!

router.post('/lobbys', lobbyController.createLobby)
router.get('/lobbys', lobbyController.getLobbys)

router.get('/lobbys/:lobbyId', lobbyController.getLobby)
router.patch('/lobbys/:lobbyId', lobbyController.startGame)

router.post('/lobbys/:lobbyId/users', lobbyController.addUser)
router.delete('/lobbys/:lobbyId/users/:userId', lobbyController.removeUser)
router.get('/lobbys/:lobbyId/users', lobbyController.getUsers)

router.patch('/lobbys/:lobbyId/users/:userId', lobbyController.changeUserState)

// Rutas de JUEGO!!
router.get('/game/users/:userId', userGameController.getMyGames)
router.get('/game/:lobbyId', territoryController.randomizeTerritories)
router.post('/game/:lobbyId', territoryController.getMap)
router.post('/game/:lobbyId/attack', userRegionController.attackTerritory)
router.post('/game/:lobbyId/moveUnits', userRegionController.moveUnits)
router.patch('/game/:lobbyId/passTurn', userGameController.passTurn)
router.get('/game/:lobbyId/turn', userGameController.getActualTurn)
router.patch('/game/:lobbyId/reforze', userRegionController.reforzeTerritory)

module.exports = router;