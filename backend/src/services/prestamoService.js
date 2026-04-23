const pool = require('../config/db');

class PrestamoService {

    static async obtenerTodos() {
        const [prestamos] = await pool.execute(`
            SELECT 
                p.id_prestamo,
                p.fecha,
                p.fecha_limite,
                p.estado,
                p.fk_cliente,
                c.nombre AS cliente_nombre,
                c.telefono AS cliente_telefono,
                GROUP_CONCAT(CONCAT(l.titulo, ' (x', dp.cantidad, ')') SEPARATOR ', ') AS libros
            FROM Prestamos p
            JOIN Cliente c ON p.fk_cliente = c.id_cliente
            LEFT JOIN DetallePrestamo dp ON dp.fk_prestamo = p.id_prestamo
            LEFT JOIN Libro l ON l.id_libro = dp.fk_libro
            GROUP BY p.id_prestamo
            ORDER BY p.fecha DESC
        `);
        return prestamos;
    }

    static async obtenerPorId(id) {
        const [prestamos] = await pool.execute(`
            SELECT p.*, c.nombre AS cliente_nombre, c.telefono AS cliente_telefono
            FROM Prestamos p
            JOIN Cliente c ON p.fk_cliente = c.id_cliente
            WHERE p.id_prestamo = ?
        `, [id]);

        if (prestamos.length === 0) {
            const error = new Error('Préstamo no encontrado');
            error.status = 404;
            throw error;
        }

        const [detalles] = await pool.execute(`
            SELECT dp.*, l.titulo, l.stock
            FROM DetallePrestamo dp
            JOIN Libro l ON l.id_libro = dp.fk_libro
            WHERE dp.fk_prestamo = ?
        `, [id]);

        return { ...prestamos[0], detalles };
    }

    static async crear(datos) {
        const { fecha, fecha_limite, fk_user, fk_cliente, libros } = datos;

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [activos] = await conn.execute(
                `SELECT id_prestamo FROM Prestamos 
                 WHERE fk_cliente = ? AND estado = 'Activo'`,
                [fk_cliente]
            );
            if (activos.length > 0) {
                const error = new Error('El cliente ya tiene un préstamo activo');
                error.status = 400;
                throw error;
            }

            for (const item of libros) {
                const [rows] = await conn.execute(
                    'SELECT titulo, stock FROM Libro WHERE id_libro = ?',
                    [item.id_libro]
                );
                if (rows.length === 0) {
                    const error = new Error(`Libro con id ${item.id_libro} no encontrado`);
                    error.status = 404;
                    throw error;
                }
                if (rows[0].stock < item.cantidad || item.cantidad <= 0) {
                    const error = new Error(
                        `Stock insuficiente para "${rows[0].titulo}". Disponible: ${rows[0].stock}`
                    );
                    error.status = 400;
                    throw error;
                }
            }

            const [resultado] = await conn.execute(
                `INSERT INTO Prestamos (fecha, fecha_limite, estado, fk_user, fk_cliente)
                 VALUES (?, ?, 'Activo', ?, ?)`,
                [fecha, fecha_limite, fk_user, fk_cliente]
            );
            const id_prestamo = resultado.insertId;

            for (const item of libros) {
                await conn.execute(
                    `INSERT INTO DetallePrestamo (fk_libro, fk_prestamo, cantidad, estado)
                     VALUES (?, ?, ?, 'Activo')`,
                    [item.id_libro, id_prestamo, item.cantidad]
                );
                await conn.execute(
                    'UPDATE Libro SET stock = stock - ? WHERE id_libro = ?',
                    [item.cantidad, item.id_libro]
                );
            }

            await conn.commit();
            return { id_prestamo, ...datos };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async cambiarEstado(id, estado) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [resultado] = await conn.execute(
                'UPDATE Prestamos SET estado = ? WHERE id_prestamo = ?',
                [estado, id]
            );
            if (resultado.affectedRows === 0) {
                const error = new Error('Préstamo no encontrado');
                error.status = 404;
                throw error;
            }

            if (estado === 'Devuelto') {
                const [detalles] = await conn.execute(
                    'SELECT fk_libro, cantidad FROM DetallePrestamo WHERE fk_prestamo = ?',
                    [id]
                );
                for (const d of detalles) {
                    await conn.execute(
                        'UPDATE Libro SET stock = stock + ? WHERE id_libro = ?',
                        [d.cantidad, d.fk_libro]
                    );
                }
                await conn.execute(
                    `UPDATE DetallePrestamo 
                     SET estado = ?, fecha_devolucion = CURDATE() 
                     WHERE fk_prestamo = ?`,
                    [estado, id]
                );
            }

            await conn.commit();
            return { message: `Préstamo marcado como ${estado}` };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async eliminar(id) {
    try {
        const [prestamos] = await pool.execute(
            'SELECT estado FROM Prestamos WHERE id_prestamo = ?', [id]
        );

        if (prestamos.length === 0) {
            const error = new Error('Préstamo no encontrado');
            error.status = 404;
            throw error;
        }

        if (prestamos[0].estado === 'Activo') {
            const error = new Error('No se puede eliminar un préstamo activo');
            error.status = 400;
            throw error;
        }

        const [resultado] = await pool.execute(
            'DELETE FROM Prestamos WHERE id_prestamo = ?', [id]
        );

        return { message: 'Préstamo eliminado correctamente' };

    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            const err = new Error('No se puede eliminar el préstamo porque tiene multas asociadas');
            err.status = 400;
            throw err;
        }
        throw error;
    }
}
}

module.exports = PrestamoService;