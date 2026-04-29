const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { generarToken } = require('../utils/jwt');
const {
    normalizeText,
    isNonEmptyString,
    isPositiveInteger,
    createValidationError
} = require('../utils/validators');

class AuthService {

    static async registrarUsuario(datos) {
        const username = normalizeText(datos.username);
        const password = String(datos.password || '');
        const fk_rol = Number(datos.fk_rol);

        if (!isNonEmptyString(username) || username.length < 3 || username.length > 50) {
            throw createValidationError('El usuario debe tener entre 3 y 50 caracteres');
        }

        if (/\s/.test(username)) {
            throw createValidationError('El usuario no puede contener espacios');
        }

        if (password.length < 6) {
            throw createValidationError('La contraseña debe tener al menos 6 caracteres');
        }

        if (!isPositiveInteger(fk_rol)) {
            throw createValidationError('El rol seleccionado no es válido');
        }

        const [existentes] = await pool.execute(
            'SELECT id_user FROM usuarios WHERE username = ?',
            [username]
        );

        if (existentes.length > 0) {
            const error = new Error('El usuario ya está registrado');
            error.status = 400;
            throw error;
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const [resultado] = await pool.execute(
            'INSERT INTO usuarios (username, contrasena, fk_rol) VALUES (?, ?, ?)',
            [username, passwordHash, fk_rol]
        );

        const nuevoUsuario = {
            id: resultado.insertId,
            username,
            fk_rol
        };

        const token = generarToken({
            id: resultado.insertId,
            email: username,
            rol: fk_rol
        });

        return { usuario: nuevoUsuario, token };
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
