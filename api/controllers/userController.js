require('dotenv').config();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const koaJwt = require('koa-jwt');

async function createUser(ctx) {
    console.log('Crear usuario');
    console.log(ctx.request.body);
    try {
        const { nickname, email, password } = ctx.request.body;
        
        const existingUserWithEmail = await User.findOne({ where: { email } });
        if (existingUserWithEmail) {
            ctx.status = 400;
            ctx.body = { error: 'Ya existe un usuario con este email' };
            return;
        }

        // Verificar si ya existe un usuario con el mismo nickname
        const existingUserWithNickname = await User.findOne({ where: { nickname } });
        if (existingUserWithNickname) {
            ctx.status = 400;
            ctx.body = { error: 'Ya existe un usuario con este nickname' };
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // Si no existe un usuario, creamos uno nuevo
        const user = await User.create({ nickname, email, password: hashedPassword, is_logged: false});

        const token = jwt.sign({ id: user.id, email: user.email}, process.env.JWT_SECRET, { expiresIn: '1h' });

        ctx.status = 200;
        ctx.body = { user, token };
        console.log('Usuario creado:', ctx.body);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al crear usuario' };
    }
}


async function getUsers(ctx) {
    console.log('Obtener todos los usuarios');
    try {
        const users = await User.findAll();
        ctx.status = 200;
        ctx.body = users;
        console.log('Usuarios encontrados:', users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al obtener usuarios' };
    }
}

async function logginUser(ctx) {
    try {
        const { email } = ctx.request.params;
        const { password } = ctx.request.body;
        
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            ctx.status = 400;
            ctx.body = { error: 'No existe un usuario con este email' };
            return;
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            ctx.status = 400;
            ctx.body = { error: 'Contraseña incorrecta' };
            return;
        }

        user.is_logged = true;
        await user.save();
        const token = jwt.sign({ id: user.id, email: user.email}, process.env.JWT_SECRET, { expiresIn: '1h' });

        ctx.body = { user: user, token: token };
        console.log('Sesion Iniciada:', user);
        ctx.status = 200;
        
    } catch (error) {
        console.error('Error al iniciar sesion:', error);
        ctx.status = 500;
        ctx.body = { error: error };
    }
}

async function closeUserSession(ctx) {
    console.log('Cerrar sesion usuario');
    console.log(ctx.request.params);
    try {
        const { email } = ctx.request.params;
        
        const userLogged = await User.findOne({ where: { email: email } });
        if (!userLogged) {
            ctx.status = 400;
            ctx.body = { error: 'No existe un usuario con ese email' };
            return;
        }
        userLogged.is_logged = false;
        ctx.status = 200;
        ctx.body = userLogged;
        console.log('Sesion cerrada:', userLogged);
    } catch (error) {
        console.error('Error al cerrar sesion:', error);
        ctx.status = 500;
        ctx.body = { error: error };
    }
}

module.exports = {
    createUser,
    getUsers,
    logginUser,
    closeUserSession
};