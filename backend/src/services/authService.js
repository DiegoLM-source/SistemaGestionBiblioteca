const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { generarToken } = require('../utils/jwt');

class AuthService {

    static async registrarUsuario(datos) {
        const { username, password, fk_rol } = datos;

        const [existentes] = await pool.execute(
            'SELECT id_user FROM Usuarios WHERE username = ?',
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
            'INSERT INTO Usuarios (username, contrasena, fk_rol) VALUES (?, ?, ?)',
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
        const [usuarios] = await pool.execute(
            'SELECT * FROM Usuarios WHERE username = ?',
            [username]
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