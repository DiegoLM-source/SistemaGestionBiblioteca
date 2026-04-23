const ClienteService = require('../services/clienteService');

class ClienteController {

    static async obtenerTodos(req, res) {
        try {
            const clientes = await ClienteService.obtenerTodos();
            res.json(clientes);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async obtenerPorId(req, res) {
        try {
            const cliente = await ClienteService.obtenerPorId(req.params.id);
            res.json(cliente);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async crear(req, res) {
        try {
            const cliente = await ClienteService.crear(req.body);
            res.status(201).json(cliente);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async actualizar(req, res) {
        try {
            const cliente = await ClienteService.actualizar(req.params.id, req.body);
            res.json(cliente);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async eliminar(req, res) {
        try {
            const resultado = await ClienteService.eliminar(req.params.id);
            res.json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}

module.exports = ClienteController;