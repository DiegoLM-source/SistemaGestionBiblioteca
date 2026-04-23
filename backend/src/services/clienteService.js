const pool = require('../config/db');

class ClienteService {

    static async obtenerTodos() {
        const [clientes] = await pool.execute('SELECT * FROM Cliente');
        return clientes;
    }

    static async obtenerPorId(id) {
        const [clientes] = await pool.execute(
            'SELECT * FROM Cliente WHERE id_cliente = ?', [id]
        );
        if (clientes.length === 0) {
            const error = new Error('Cliente no encontrado');
            error.status = 404;
            throw error;
        }
        return clientes[0];
    }

    static async crear(datos) {
        const { nombre, correo, telefono } = datos;
        const [resultado] = await pool.execute(
            'INSERT INTO Cliente (nombre, correo, telefono) VALUES (?, ?, ?)',
            [nombre, correo, telefono]
        );
        return { id_cliente: resultado.insertId, ...datos };
    }

    static async actualizar(id, datos) {
        const { nombre, correo, telefono } = datos;
        const [resultado] = await pool.execute(
            'UPDATE Cliente SET nombre=?, correo=?, telefono=? WHERE id_cliente=?',
            [nombre, correo, telefono, id]
        );
        if (resultado.affectedRows === 0) {
            const error = new Error('Cliente no encontrado');
            error.status = 404;
            throw error;
        }
        return { id_cliente: id, ...datos };
    }

    static async eliminar(id) {
        const [resultado] = await pool.execute(
            'DELETE FROM Cliente WHERE id_cliente = ?', [id]
        );
        if (resultado.affectedRows === 0) {
            const error = new Error('Cliente no encontrado');
            error.status = 404;
            throw error;
        }
        return { message: 'Cliente eliminado correctamente' };
    }
}

module.exports = ClienteService;