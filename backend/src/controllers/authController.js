const AuthService = require('../services/authService');

class AuthController {

    static async register(req, res) {
        try {
            const { username, password, fk_rol } = req.body;

            const resultado = await AuthService.registrarUsuario({
                username,
                password,
                fk_rol
            });

            res.status(201).json(resultado);

        } catch (error) {
            res.status(error.status || 500).json({
                message: error.message
            });
        }
    }

    static async login(req, res) {
        
        try {
            console.log("Body recibido:", req.body);
            const { username, password } = req.body;

            const resultado = await AuthService.login(username, password);

            res.json(resultado);

        } catch (error) {
            res.status(error.status || 500).json({
                message: error.message
            });
        }
    }
}

module.exports = AuthController;