const PrestamoService = require('../services/prestamoService');

class PrestamoController {

    static async obtenerTodos(req, res) {
        try {
            const prestamos = await PrestamoService.obtenerTodos();
            res.json(prestamos);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async obtenerPorId(req, res) {
        try {
            const prestamo = await PrestamoService.obtenerPorId(req.params.id);
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
            const resultado = await PrestamoService.eliminar(req.params.id, estado);
            res.json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}

module.exports = PrestamoController;