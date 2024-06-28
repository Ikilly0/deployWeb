const sequelize  = require('./models/sequelize.js');
const User  = require('./models/user.js');
const { Artillery, Cavalry, Infantry } = require('./models/unit.js');
const Card = require('./models/card.js');
const Lobby = require('./models/lobby.js');
const Territory = require('./models/territory.js');
const UserGame  = require('./models/usergame.js');
const UserLobby  = require('./models/userlobby.js');

async function checkTableExists(model) {
    try {
        await sequelize.sync();
        const tableExists = await sequelize.getQueryInterface().showAllTables()
            .then(tableNames => tableNames.includes(model.tableName));
        
        if (tableExists) {
            console.log(`La tabla ${model.tableName} existe en la base de datos.`);
        } else {
            console.log(`La tabla ${model.tableName} no existe en la base de datos.`);
        }
    } catch (error) {
        console.error(`Error al verificar la existencia del modelo ${model.name} en la base de datos:`, error);
    }
}

(async () => {
    await checkTableExists(User);
    await checkTableExists(Artillery);
    await checkTableExists(Cavalry);
    await checkTableExists(Infantry);
    await checkTableExists(Card);
    await checkTableExists(Lobby);
    await checkTableExists(Territory);
    await checkTableExists(UserGame);
    await checkTableExists(UserLobby);
})();