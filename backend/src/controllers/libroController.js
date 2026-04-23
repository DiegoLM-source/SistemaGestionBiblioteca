const LibroService = require('../services/libroService');

class LibroController {

    static async obtenerTodos(req, res) {
        try {
            const libros = await LibroService.obtenerTodos();
            res.json(libros);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async obtenerPorId(req, res) {
        try {
            const libro = await LibroService.obtenerPorId(req.params.id);
            res.json(libro);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async crear(req, res) {
        try {
            const libro = await LibroService.crear(req.body);
            res.status(201).json(libro);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async actualizar(req, res) {
        try {
            const libro = await LibroService.actualizar(req.params.id, req.body);
            res.json(libro);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    static async eliminar(req, res) {
        try {
            const resultado = await LibroService.eliminar(req.params.id);
            res.json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}

module.exports = LibroController;