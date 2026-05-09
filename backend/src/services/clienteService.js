const pool = require('../config/db');
const {
    normalizeText,
    isNonEmptyString,
    isValidEmail,
    isValidPhone,
    createValidationError
} = require('../utils/validators');

class ClienteService {
    static validarDatos(datos) {
        const nombre = normalizeText(datos.nombre);
        const correo = normalizeText(datos.correo) || null;
        const telefono = normalizeText(datos.telefono) || null;

        if (!isNonEmptyString(nombre) || nombre.length < 3 || nombre.length > 100) {
            throw createValidationError('El nombre debe tener entre 3 y 100 caracteres');
        }

        if (!isValidEmail(correo)) {
            throw createValidationError('El correo no tiene un formato válido');
        }

        if (!isValidPhone(telefono)) {
            throw createValidationError('El teléfono debe contener entre 7 y 15 dígitos');
        }

        return { nombre, correo, telefono };
    }

    static async obtenerTodos() {
        const [clientes] = await pool.execute('SELECT * FROM Cliente');
        return clientes;
    }

    static async obtenerPorId(id) {
        const [clientes] = await pool.execute(
            'SELECT * FROM cliente WHERE id_cliente = ?', [id]
        );
        if (clientes.length === 0) {
            const error = new Error('Cliente no encontrado');
            error.status = 404;
            throw error;
        }
        return clientes[0];
    }

    static async crear(datos) {
        const { nombre, correo, telefono } = this.validarDatos(datos);
        const [resultado] = await pool.execute(
            'INSERT INTO cliente (nombre, correo, telefono) VALUES (?, ?, ?)',
            [nombre, correo, telefono]
        );
        return { id_cliente: resultado.insertId, nombre, correo, telefono };
    }

    static async actualizar(id, datos) {
        const { nombre, correo, telefono } = this.validarDatos(datos);
        const [resultado] = await pool.execute(
            'UPDATE cliente SET nombre=?, correo=?, telefono=? WHERE id_cliente=?',
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
            'DELETE FROM cliente WHERE id_cliente = ?', [id]
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
