const pool = require('../config/db');
const {
    isValidDate,
    isPositiveInteger,
    createValidationError
} = require('../utils/validators');

class ReservaService {
    static schemaReady = false;

    static async ensureSchema() {
        if (this.schemaReady) {
            return;
        }

        const [columns] = await pool.execute(
            `SELECT COLUMN_NAME
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = 'reserva'`
        );

        const columnNames = columns.map((column) => column.COLUMN_NAME);
        const alterStatements = [];

        if (!columnNames.includes('fecha_reclamo')) {
            alterStatements.push('ADD COLUMN fecha_reclamo DATE NULL AFTER fecha_reserva');
        }

        if (!columnNames.includes('fk_prestamo')) {
            alterStatements.push('ADD COLUMN fk_prestamo INT NULL AFTER fk_libro');
        }

        if (alterStatements.length > 0) {
            await pool.execute(`ALTER TABLE reserva ${alterStatements.join(', ')}`);
        }

        const [indexes] = await pool.execute(
            `SELECT INDEX_NAME
             FROM information_schema.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = 'reserva'`
        );

        const indexNames = indexes.map((index) => index.INDEX_NAME);

        if (!indexNames.includes('fk_reserva_prestamo')) {
            await pool.execute(
                'ALTER TABLE reserva ADD KEY fk_reserva_prestamo (fk_prestamo)'
            );
        }

        const [constraints] = await pool.execute(
            `SELECT CONSTRAINT_NAME
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = 'reserva'
             AND COLUMN_NAME = 'fk_prestamo'
             AND REFERENCED_TABLE_NAME = 'prestamos'`
        );

        if (constraints.length === 0) {
            await pool.execute(`
                ALTER TABLE reserva
                ADD CONSTRAINT fk_reserva_prestamo
                FOREIGN KEY (fk_prestamo) REFERENCES prestamos (id_prestamo)
                ON DELETE SET NULL
                ON UPDATE CASCADE
            `);
        }

        this.schemaReady = true;
    }

    static async obtenerTodas() {
        await this.ensureSchema();

        const [reservas] = await pool.execute(`
            SELECT
                r.id_reserva,
                r.fecha_reserva,
                r.fecha_reclamo,
                r.estado,
                r.fk_cliente,
                r.fk_libro,
                r.fk_prestamo,
                c.nombre AS cliente_nombre,
                c.telefono AS cliente_telefono,
                l.titulo AS libro_titulo,
                l.autor AS libro_autor
            FROM reserva r
            JOIN cliente c ON c.id_cliente = r.fk_cliente
            JOIN libro l ON l.id_libro = r.fk_libro
            ORDER BY r.fecha_reserva DESC, r.id_reserva DESC
        `);

        return reservas;
    }

    static async obtenerPorId(id) {
        await this.ensureSchema();

        const [reservas] = await pool.execute(`
            SELECT
                r.*,
                c.nombre AS cliente_nombre,
                c.telefono AS cliente_telefono,
                l.titulo AS libro_titulo,
                l.autor AS libro_autor,
                l.stock AS libro_stock
            FROM reserva r
            JOIN cliente c ON c.id_cliente = r.fk_cliente
            JOIN libro l ON l.id_libro = r.fk_libro
            WHERE r.id_reserva = ?
        `, [id]);

        if (reservas.length === 0) {
            const error = new Error('Reserva no encontrada');
            error.status = 404;
            throw error;
        }

        return reservas[0];
    }

    static async crear(datos) {
        await this.ensureSchema();

        const { fecha_reserva, fk_cliente, fk_libro } = datos;

        if (!isValidDate(fecha_reserva)) {
            throw createValidationError('La fecha de reserva no es válida');
        }

        if (!isPositiveInteger(fk_cliente) || !isPositiveInteger(fk_libro)) {
            throw createValidationError('Cliente y libro son obligatorios');
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [libros] = await conn.execute(
                'SELECT id_libro, titulo, stock FROM libro WHERE id_libro = ? FOR UPDATE',
                [fk_libro]
            );

            if (libros.length === 0) {
                const error = new Error('Libro no encontrado');
                error.status = 404;
                throw error;
            }

            if (libros[0].stock < 1) {
                const error = new Error(`No hay stock disponible para "${libros[0].titulo}"`);
                error.status = 400;
                throw error;
            }

            const [clientes] = await conn.execute(
                'SELECT id_cliente FROM cliente WHERE id_cliente = ?',
                [fk_cliente]
            );

            if (clientes.length === 0) {
                const error = new Error('Cliente no encontrado');
                error.status = 404;
                throw error;
            }

            const [duplicadas] = await conn.execute(
                `SELECT id_reserva
                 FROM reserva
                 WHERE fk_cliente = ? AND fk_libro = ? AND estado = 'Reservado'`,
                [fk_cliente, fk_libro]
            );

            if (duplicadas.length > 0) {
                const error = new Error('Ese cliente ya tiene este libro reservado');
                error.status = 400;
                throw error;
            }

            const [resultado] = await conn.execute(
                `INSERT INTO reserva (fecha_reserva, estado, fk_cliente, fk_libro)
                 VALUES (?, 'Reservado', ?, ?)`,
                [fecha_reserva, fk_cliente, fk_libro]
            );

            await conn.execute(
                'UPDATE libro SET stock = stock - 1 WHERE id_libro = ?',
                [fk_libro]
            );

            await conn.commit();
            return {
                id_reserva: resultado.insertId,
                fecha_reserva,
                estado: 'Reservado',
                fk_cliente,
                fk_libro
            };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async reclamar(id, datos) {
        await this.ensureSchema();

        const { fecha_limite, fk_user } = datos;

        if (!fecha_limite || !fk_user) {
            const error = new Error('Fecha límite y usuario responsable son obligatorios');
            error.status = 400;
            throw error;
        }

        if (!isValidDate(fecha_limite) || !isPositiveInteger(fk_user)) {
            throw createValidationError('La fecha límite o el usuario responsable no son válidos');
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [reservas] = await conn.execute(
                `SELECT *
                 FROM reserva
                 WHERE id_reserva = ?
                 FOR UPDATE`,
                [id]
            );

            if (reservas.length === 0) {
                const error = new Error('Reserva no encontrada');
                error.status = 404;
                throw error;
            }

            const reserva = reservas[0];

            if (reserva.estado !== 'Reservado') {
                const error = new Error('Solo se pueden reclamar reservas en estado Reservado');
                error.status = 400;
                throw error;
            }

            const [activos] = await conn.execute(
                `SELECT id_prestamo
                 FROM prestamos
                 WHERE fk_cliente = ? AND estado = 'Activo'`,
                [reserva.fk_cliente]
            );

            if (activos.length > 0) {
                const error = new Error('El cliente ya tiene un préstamo activo');
                error.status = 400;
                throw error;
            }

            const [resultadoPrestamo] = await conn.execute(
                `INSERT INTO prestamos (fecha, fecha_limite, estado, fk_user, fk_cliente)
                 VALUES (CURDATE(), ?, 'Activo', ?, ?)`,
                [fecha_limite, fk_user, reserva.fk_cliente]
            );

            await conn.execute(
                `INSERT INTO detalleprestamo (fk_libro, fk_prestamo, cantidad, estado)
                 VALUES (?, ?, 1, 'Activo')`,
                [reserva.fk_libro, resultadoPrestamo.insertId]
            );

            await conn.execute(
                `UPDATE reserva
                 SET estado = 'Reclamado', fecha_reclamo = CURDATE(), fk_prestamo = ?
                 WHERE id_reserva = ?`,
                [resultadoPrestamo.insertId, id]
            );

            await conn.commit();
            return {
                message: 'Reserva reclamada y convertida en préstamo',
                id_prestamo: resultadoPrestamo.insertId
            };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async cancelar(id) {
        await this.ensureSchema();

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [reservas] = await conn.execute(
                'SELECT * FROM reserva WHERE id_reserva = ? FOR UPDATE',
                [id]
            );

            if (reservas.length === 0) {
                const error = new Error('Reserva no encontrada');
                error.status = 404;
                throw error;
            }

            const reserva = reservas[0];

            if (reserva.estado !== 'Reservado') {
                const error = new Error('Solo se pueden cancelar reservas en estado Reservado');
                error.status = 400;
                throw error;
            }

            await conn.execute(
                `UPDATE reserva
                 SET estado = 'Cancelado'
                 WHERE id_reserva = ?`,
                [id]
            );

            await conn.execute(
                'UPDATE libro SET stock = stock + 1 WHERE id_libro = ?',
                [reserva.fk_libro]
            );

            await conn.commit();
            return { message: 'Reserva cancelada correctamente' };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
}

module.exports = ReservaService;
