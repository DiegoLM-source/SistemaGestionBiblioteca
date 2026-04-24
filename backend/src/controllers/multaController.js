const MultaService = require('../services/multaService');

class MultaController {

    static async obtenerTodos(req, res) {
        try {
            const multas = await MultaService.obtenerTodos();
            res.json(multas);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async crear(req, res) {
    try {
        const { fk_cliente, tipo, monto, descripcion, fk_prestamo, fk_libro } = req.body;
        if (!fk_cliente || !tipo || !monto) {
            return res.status(400).json({ message: 'Cliente, tipo y monto son obligatorios' });
        }
        const resultado = await MultaService.crearOAgregarDetalle(
            fk_cliente, tipo, monto, descripcion,
            null, fk_prestamo || null, fk_libro || null
        );
        res.status(201).json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

    static async marcarPagada(req, res) {
        try {
            const resultado = await MultaService.marcarPagada(req.params.id);
            res.json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async eliminar(req, res) {
        try {
            const resultado = await MultaService.eliminar(req.params.id);
            res.json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}

module.exports = MultaController;