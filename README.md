# LRWebServices_backend

## Reglas del servidor
    - Para crear un lobby un jugador debera ser el host de este, y decidir si sera publico o privado con clave

    - Una vez creado el lobby para emperzar la partida se debera unir al menos un jugador mas, por lo tanto existiran 2 jugadores que deberan dar listo a la partida para comenzar, en caso de que de solo uno, empezara un temporizador de x tiempo

    - Una vez iniciada la partida se repartiran los territorios de manera equitativa dentro de lo posible (En caso de sobrar 1 terreno, este se lo quedara el jugador de id mas bajo, es decir, los primeros en crearse la cuenta tendran una ventaja estrategica), asignando a cada territorio una unidad obligatoria.

    - Luego de asignar los territorios se le asignara a cada jugador la cantidad de (territorios/jugadores)*2 unidades para que pueda distribuirla como quieran dentro de su territorio

    - Al turno de un jugador, este podra realizar todos los movimientos y ataques que este desee, para pasar de turno se debera mandar la instruccion de pasar de turno o al iniciar el turno existira un contador de 5 minutos, el cual pasara el turno del jugador si llega a 0

    - Al momento de atacar, el jugador debera indicar con cuanto ejercito atacara, siendo la menor cantidad 2 y la mayor 4. dando la cantidad de dados de 1 a 3. Si el jugador defensor tiene 2 o mas unidades en ese territorio, se lanzaran automaticamente dos dados que haran de defensa ante el atacante. Si tiene solo una unidad, se atacara con un solo dado

    - Si el atacante gana automaticamente se trazladara una unidad de las atacantes.


## Reglas de juego 
    - Para jugar se necesita un minimo de 2 jugadores y un maximo de 4 jugadores
    
    - El juego consiste de 32 territorios, 32 cartas asociadas a cada territorio, cada carta puede contener un tipo de unidad ( infanteria ,caballeria, artilleria)

    - Al momento de iniciar el juego se repartiran los territorios de manera equitativa, si uno llega a sobrar se le entregara al host de la partida como bonus, Ademas se entregaran (territorios/jugadores)*2 unidades para que pueda distribuirla como quieran dentro de su territorio

    - En tu turno podras realizar todas las acciones que quieras, desde movimiento, reforzar , atacar y canjear cartas

    - si quieres mover tropas entre tus territorios deberas hacerlo siempre que tengas mas de 1 tropa en tu territorio. y podras escoger cuantas tropas deseas mover

    - En caso de reforzar, podras hacerlo con movimientos o con unidades de tu inventario, escogiendo cuantas tropas deseas reforzar. Esto solo funcionara en tu propio territorio

    - En caso de atacar, deberas tener un minimo de 2 unidades en tu territorio, y podras escoger atacar con 2, 3 o 4. Esto te entregara desde 1 dado a 3 dados respectivamente.

    - Si el territorio que deseas atacar tiene 2 o mas unidades, siempre se defendera con dos dados.

    - Cuando ataques se tiraran los dados tuyos con los del enemigo al mismo tiempo y se comparara el dado mas alto tuyo, con el dado mas alto del atacante, ordenando los dados de mayor a menor. 

    - En caso de el atacante ganar a los dados mas altos del enemigo, se descontaran las unidades equivalentes a la cantidad de veces que hayas ganado, es decir si en la tirada de dados obtienes dos valores mas altos que los del enemigo, le restas dos tropas. Caso contrario el enemigo obtiene dados mas altos que los tuyos, se te descontaran la cantidad de tropas equivalentes a los dados.

    - En caso de ganar el territorio, una unidad que ataco se movera inmediatamente a ese territorio. Y se te otorgara una carta al azar

    - En caso de canjear cartas, podras hacerlo siempre y cuando tengas 3 cartas de unidades iguales o 3 cartas de unidades distintas. Si una de esas cartas contiene un territorio que ya posees, se te asignaran 2 unidades a ese territorio. Al momento de canjear cartas se te otorgaran 5 unidades, cada vez que cambies cartas se te entregaran 5 unidades adicionales. Es decir si es la primera vez se entregan 5 unidades, la segunda 10 y la tercera 15, etc...

    - Un jugador perdera la partida si se queda sin territorios

    - Ganara partida el jugador que logre dominar todo el territorio o complete su mision secreta (se está pensando en eliminar esta ultima condicion, y solo gane si conquista todo el territorio).

## Modo de uso de la api con las jugadas

Solo los endpoints get y post entregan una respuesta (body). Mientras que los métodos patch, que son la mayoría que representan acciones y modificaciones en turnos modifican las relaciones de la base de datos. 

Puntos importantes y modificaciones:

    - En la primera entrega se modelaba la comunicación http mediante source-targets, por ejemplo:
    {
      "source":"user_log"
      "target":"signup",
      "user": "pepito",
      "email": "pepito@dcc.uc",
      "password": "mgteldcc"
    }
    En la práctica descubrimos que esto no es sostenible y es una mala práctica usar un endpoint en comun para controlar distintas 
    acciones. Para esto proveemos los endpoints;
            router.get('/usuarios', userController.getUsers)
            router.post('/usuarios', userController.createUser);
    El user controller se encarga de retornar una respuesta en corcondancia al body de la request. Dejaremos la responsabilidad de 
    como gestionar las respuestas de las consultas al front end. Tambien hacemos uso de params junto con body en los endpoints, por 
    ejemplo, si el front end necesita mostrar que el jugador cambio su estado en la lobby a listo, ocupamos el endpoint:

            router.patch('/lobbys/:lobbyId/users/:userId', lobbyController.changeUserState)

    Y el body correspondiente es:

            {
                "state": "listo"
            }

    Tenemos modelado 3 acciones de jugadas, reforzar territorios, mover tropas, y atacar territorio. Las dos primeras fueron 
    testeadas y damos la garantia que funcionan. La ultima de ellas es más dificil de testear por temas de tiempo pero están 
    las bases listas. Los endpoints con las funciones correspondientes son los siguientes.

        router.get('/game/:lobbyId/attack', userRegionController.attackTerritory)
        router.post('/game/:lobbyId/moveUnits', userRegionController.moveUnits)
        router.patch('/game/:lobbyId/passTurn', userGameController.passTurn)
        router.get('/game/:lobbyId/turn', userGameController.getActualTurn)
        router.patch('/game/:lobbyId/reforze', userRegionController.reforzeTerritory)

    Para la funcion de ataque, debemos tener en cuenta las reglas, poseemos hasta 3 tiradas de dados para el atacante y 2 para
    el defensor. Entonces, la idea de la interacción es la siguiente, el ataque es "solicitado" cuando el jugador haya 
    seleccionado cuantos dados tirar, desde un territorio, hasta otro territorio enemigo, con estos requisitos en marcha
    el servidor tira los dados automaticamente de ambos jugadores, y solo retorna los dados, ya que internamente la funcion
    relacionada al endpoint modifica el tablero entero junto con las tablas relacionadas. Entonces el front end con esta jugada
    de 'ataque' recibe los dados y los muestra, dando la impresión al jugador que esta tirando los dados uno por uno, cuando estos
    ya fueron lanzados realmente, pero el resultado lógicamente es el mismo. Entonces, terminada la tirada de dados, debe 
    recargar el mapa, con el endpoint relacionado a la funcion 'getMap'. 

    La mayoria de endpoints funcionarán así (y no como fue propuesto en la entrega anterior), ya que es una manera mucho más
    escalable. Cada endpoint hace una sola cosa y la hace correctamente.

A continuación se muestran los body y params que usan las requests a la api:

POST    /territories:    Pobla los territorios del mapa junto con sus asociaciones con otros territorios (vecinos)

    - No requiere body ni params

GET    /users:           Retorna un json con todos los usuarios y sus modelos

    - No requiere body ni params

POST   /users:           Crea un usuario (uso directo con register)

    - Requiere body:
```json
{
    "nickname": "grupo Alonsos",
    "email": "grupo@alonsos.lrws",
    "password: "grupo123"
}
```
    
PATCH   /users/:email    Cierra la sesión de un usuario

    - No requiere body

POST    /users/:email    Inicia la sesión de un usuario

    - Requiere body

```json
{
    "password: "grupo123"
}
```
POST    /lobbys          Crea una lobby

    - Requiere body
```json
{
    "host_id": 1,
    "type": false,
}
```
```json
{
    "host_id": 2,
    "type": true,
    "password": "lobby123"
}
```

GET    /lobbys            Retorna todas las lobbys publicas y privadas

    - No requiere Body ni Params

GET    /lobbys/:lobbyId   Retorna una lobby dado su Id

    - No requiere Body

PATCH    /lobbys/:lobbyId    Inicia la partida de una Lobby con id: lobbyId

    - No requiere Body

POST    /lobbys/:lobbyId/users    Añade un jugador a la lobby con id: lobbyId

    - Requiere Body
```json
{
    "userId": 3,
    "password": "lobby123" //si no tiene password la lobby, no es necesario proporcionarla
}
```

DELETE    /lobbys/:lobbyId/users/:userId    Elimina un jugador con id: userId de la lobby con id: lobbyId

    - No requiere Body

GET    /lobbys/:lobbyID/users    Retorna todos los usuarios de una lobby con id: lobbyId

    - No requiere Body

PATCH    /lobbys/:lobbyId/users/:userId    Cambia el estado de un jugador con id: userId de la lobby con id: lobbyId

    - Requiere Body

```json
{
    "state": "listo" // "no listo"
}
```

POST    /game/:lobbyId    Asigna territorios de manera aleatoria a los jugadores del juego con lobbyId: lobbyId

    - No requiere Body

GET    /game/:lobbyId    Retorna el mapa del juego con lobbyId: lobbyId, mostrando el modelo de cada userTerritory

    - No requiere Body

GET    /game/:lobbyId/attack,  Genera un ataque de un jugador acon un territorio a otro atacable dentro de un juego con id: lobbyId
                               Retorna el resultados de los dados de los jugadores, no el resultado del ataque, ya que este es
                               visible con otro endpoint (separación de responsabilidades)
                               
    - Requiere Body
```json
{
    "attackerId": 1,
    "attackerTerritoryId": 27,
    "defensorId": 2,
    "defensorTerritoryId": 24,
    "unit_count": 4,
    "diceCount": 3
}
```

POST    /game/:lobbyId/moveUnits,    Retorna el movimiento de unidades de un jugador de un territorio a otro de sus terrotorios
                                     dentro de un juego con id: lobbyId

    - Requiere Body

```json
{
    "userId": 1,
    "originTerritoryId": 27,
    "destinationTerritoryId": 24,
    "unit_count": 4
}
```

PATCH    /game/:lobbyId/passTurn,    Cambia el turno actual del juego +=1 con id: lobbbyId

    - No requiere Body

GET    /game/:lobbyId/turn,          Retorna el turno actual del juego con id: lobbyId

PATCH    /game/:lobbyId/reforze,     Añade tropas a un territorio de un juego con id: lobbyId

    - Requiere Body

```json
{
    "userId": 1,
    "territoryId": 27,
    "unit_count": 4
}
```

## Documentacion para levantar la aplicacion y montar la base de datos

Para poder correr el back-end, se necesita crear una base de datos en la máquina llamada 'web' y crear(asociar) un rol 'prouser' con contraseña 'admin1214' mediante la consola de comandos psql.
Una vez exista esta base de datos con el rol de usuario, se deben instalar las dependencias del proyecto, para esto, hacemos uso del comando:

```code
    npm install
```
Luego, para iniciar la aplicacion, basta con usar el comando:


```code
    node main_server.js
```
Siempre que se inicia la aplicacion, sequelize se encarga de revisar la existencia de las tablas en la base de datos, si una tabla no esta creada, este la crea. Es importante que, si es primera vez
que se inicia la api, se debe hacer una solicitud POST a la uri localhost:3000/territories, ya que este endpoint se relaciona con un script que pobla la base de datos territories para asignar
los vecinos y los id de cada territorio.
