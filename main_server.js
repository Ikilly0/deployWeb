require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const serve = require('koa-static'); // Importa koa-static
const path = require('path');
const apiRouter = require('./api/router.js');
const tablasChek = require('./api/tablasCheck.js');
const app = new Koa();
const koaJwt = require('koa-jwt');

// Configurar CORS
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// Configurar bodyParser
app.use(bodyParser());

// Configurar koa-jwt para proteger las rutas excepto /users y /territories
app.use(koaJwt({ secret: process.env.JWT_SECRET }).unless({ path: [/^\/users/, /^\/territories/] }));

// Servir los archivos estáticos de la carpeta dist
app.use(serve(path.join(__dirname, './dist'))); // Ajusta el path según tu estructura de carpetas

// Configurar rutas del API
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor KoaJS escuchando en el puerto ${PORT}`);
});