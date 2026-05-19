const PrestamoService = require('../services/prestamoService');

class PrestamoController {

    static async obtenerTodos(req, res) {
        try {
            const prestamos = await PrestamoService.obtenerTodos({
                rol: req.usuario?.rol,
                userId: req.usuario?.id
            });
            res.json(prestamos);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async obtenerPorId(req, res) {
        try {
            const prestamo = await PrestamoService.obtenerPorId(req.params.id, {
                rol: req.usuario?.rol,
                userId: req.usuario?.id
            });
            res.json(prestamo);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async crear(req, res) {
        try {
            const prestamo = await PrestamoService.crear(req.body);
            res.status(201).json(prestamo);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async cambiarEstado(req, res) {
        try {
            const { estado } = req.body;
            const resultado = await PrestamoService.cambiarEstado(req.params.id, estado);
            res.json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async eliminar(req, res) {
        try {
            const resultado = await PrestamoService.eliminar(req.params.id);
            res.json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async crearSolicitud(req, res) {
        try {
            const { id_libro, cantidad } = req.body;
            const resultado = await PrestamoService.crearSolicitud({
                userId: req.usuario?.id,
                id_libro,
                cantidad
            });
            res.status(201).json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async obtenerSolicitudesUsuario(req, res) {
        try {
            const solicitudes = await PrestamoService.obtenerSolicitudesUsuario(req.usuario?.id);
            res.json(solicitudes);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async obtenerSolicitudesAdmin(req, res) {
        try {
            const solicitudes = await PrestamoService.obtenerSolicitudesAdmin();
            res.json(solicitudes);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async aprobarSolicitud(req, res) {
        try {
            const { fecha_recogida } = req.body;
            const resultado = await PrestamoService.aprobarSolicitud(
                req.params.id,
                fecha_recogida
            );
            res.json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}

module.exports = PrestamoController;
