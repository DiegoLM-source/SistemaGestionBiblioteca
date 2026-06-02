const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Acceso denegado. Token no proporcionado o formato inválido' 
        });
    }

    token = token.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token inválido o expirado' 
        });
    }
};

const autorizarRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        // ✅ Protección defensiva — nunca lanza TypeError
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        // ✅ Normaliza tipos para evitar "1" !== 1
        const rolUsuario = Number(req.usuario.rol);
        const tienePermiso = rolesPermitidos.map(Number).includes(rolUsuario);

        if (!tienePermiso) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. No tienes permisos para realizar esta acción'
            });
        }

        next();
    };
};

module.exports = { verificarToken, autorizarRoles };