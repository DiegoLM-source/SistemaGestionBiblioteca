const ReservaService = require('../services/reservaService');

class ReservaController {
    static async obtenerTodas(req, res) {
        try {
            const reservas = await ReservaService.obtenerTodas();
            res.json(reservas);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async obtenerPorId(req, res) {
        try {
            const reserva = await ReservaService.obtenerPorId(req.params.id);
            res.json(reserva);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async crear(req, res) {
        try {
            const reserva = await ReservaService.crear(req.body);
            res.status(201).json(reserva);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async reclamar(req, res) {
        try {
            const resultado = await ReservaService.reclamar(req.params.id, req.body);
            res.json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async cancelar(req, res) {
        try {
            const resultado = await ReservaService.cancelar(req.params.id);
            res.json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}

module.exports = ReservaController;
