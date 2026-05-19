const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { generarToken } = require('../utils/jwt');
const ClienteUsuarioService = require('./clienteUsuarioService');
const {
    normalizeText,
    isNonEmptyString,
    createValidationError
} = require('../utils/validators');

class AuthService {

   static async registrarUsuario(datos) {
    const { username, password, nombre, correo, telefono } = datos;
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [existentes] = await conn.execute(
            'SELECT id_user FROM usuarios WHERE username = ?',
            [username]
        );
        if (existentes.length > 0) {
            const error = new Error('El usuario ya está registrado');
            error.status = 400;
            throw error;
        }

        const [correoExistente] = await conn.execute(
            'SELECT id_user FROM usuarios WHERE correo = ?',
            [correo]
        );
        if (correoExistente.length > 0) {
            const error = new Error('El correo ya está registrado');
            error.status = 400;
            throw error;
        }

        const [resultadoCliente] = await conn.execute(
            'INSERT INTO cliente (nombre, correo, telefono) VALUES (?, ?, ?)',
            [nombre, correo, telefono || null]
        );
        const id_cliente = resultadoCliente.insertId;

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const [resultadoUsuario] = await conn.execute(
            `INSERT INTO usuarios (username, contrasena, correo, fk_rol, fk_cliente)
             VALUES (?, ?, ?, 2, ?)`,
            [username, passwordHash, correo, id_cliente]
        );

        const token = generarToken({
            id: resultadoUsuario.insertId,
            email: correo,
            rol: 2
        });

        await conn.commit();

        return {
            usuario: {
                id: resultadoUsuario.insertId,
                username,
                fk_rol: 2,
                fk_cliente: id_cliente
            },
            token
        };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

    static async login(username, password) {
        const usernameNormalizado = normalizeText(username);
        const passwordNormalizada = String(password || '');

        if (!isNonEmptyString(usernameNormalizado) || !passwordNormalizada) {
            throw createValidationError('Usuario y contraseña son obligatorios');
        }

        const [usuarios] = await pool.execute(
            'SELECT * FROM usuarios WHERE username = ?',
            [usernameNormalizado]
        );

        const usuario = usuarios[0];

        if (!usuario) {
            const error = new Error('Credenciales inválidas');
            error.status = 401;
            throw error;
        }

        const passwordValida = await bcrypt.compare(password, usuario.contrasena);

        if (!passwordValida) {
            const error = new Error('Credenciales inválidas');
            error.status = 401;
            throw error;
        }

        const token = generarToken({
            id: usuario.id_user,
            email: usuario.correo ?? usuario.username,
            rol: usuario.fk_rol
        });

        const { contrasena, ...usuarioSinPassword } = usuario;
        return { usuario: usuarioSinPassword, token };
    }
}

module.exports = AuthService;
