const pool = require('../config/db');

class MultaService {

    static async obtenerTodos() {
    const [multas] = await pool.execute(`
        SELECT 
            m.*,
            c.nombre AS cliente_nombre,
            c.telefono AS cliente_telefono,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id_detalle', dm.id_detalle,
                    'tipo', dm.tipo,
                    'descripcion', dm.descripcion,
                    'monto', dm.monto,
                    'fecha', dm.fecha,
                    'fk_prestamo', dm.fk_prestamo,
                    'fk_libro', dm.fk_libro,
                    'libro', COALESCE(
                        l.titulo,
                        (
                            SELECT GROUP_CONCAT(lb.titulo SEPARATOR ', ')
                            FROM DetallePrestamo dp
                            JOIN Libro lb ON lb.id_libro = dp.fk_libro
                            WHERE dp.fk_prestamo = dm.fk_prestamo
                        )
                    )
                )
            ) AS detalles
        FROM Multa m
        JOIN Cliente c ON m.fk_cliente = c.id_cliente
        LEFT JOIN DetalleMulta dm ON dm.fk_multa = m.id_multa
        LEFT JOIN Libro l ON l.id_libro = dm.fk_libro
        GROUP BY m.id_multa
        ORDER BY m.fecha_multa DESC
    `);
    return multas.map(m => ({
        ...m,
        detalles: typeof m.detalles === 'string' ? JSON.parse(m.detalles) : m.detalles
    }));
}

static async crearOAgregarDetalle(fk_cliente, tipo, monto, descripcion = null, fecha = null, fk_prestamo = null, fk_libro = null) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const fechaHoy = fecha || new Date().toISOString().slice(0, 10);

        const [existentes] = await conn.execute(
            'SELECT id_multa FROM Multa WHERE fk_cliente = ? AND estado = false',
            [fk_cliente]
        );

        let id_multa;
        if (existentes.length > 0) {
            id_multa = existentes[0].id_multa;
        } else {
            const [resultado] = await conn.execute(
                'INSERT INTO Multa (fecha_multa, estado, total, fk_cliente) VALUES (?, false, 0, ?)',
                [fechaHoy, fk_cliente]
            );
            id_multa = resultado.insertId;
        }

        await conn.execute(
            `INSERT INTO DetalleMulta (fk_multa, tipo, descripcion, monto, fecha, fk_prestamo, fk_libro) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_multa, tipo, descripcion, monto, fechaHoy, fk_prestamo, fk_libro]
        );

        await conn.execute(
            'UPDATE Multa SET total = (SELECT SUM(monto) FROM DetalleMulta WHERE fk_multa = ?) WHERE id_multa = ?',
            [id_multa, id_multa]
        );

        await conn.commit();
        return { id_multa, message: 'Multa registrada correctamente' };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

    static async marcarPagada(id) {
        const [resultado] = await pool.execute(
            'UPDATE Multa SET estado = true WHERE id_multa = ?', [id]
        );
        if (resultado.affectedRows === 0) {
            const error = new Error('Multa no encontrada');
            error.status = 404;
            throw error;
        }
        return { message: 'Multa marcada como pagada' };
    }

    static async eliminar(id) {
        const [multa] = await pool.execute(
            'SELECT estado FROM Multa WHERE id_multa = ?', [id]
        );
        if (multa.length === 0) {
            const error = new Error('Multa no encontrada');
            error.status = 404;
            throw error;
        }
        if (!multa[0].estado) {
            const error = new Error('No se puede eliminar una multa pendiente');
            error.status = 400;
            throw error;
        }
        await pool.execute('DELETE FROM Multa WHERE id_multa = ?', [id]);
        return { message: 'Multa eliminada correctamente' };
    }

    static async procesarVencidos() {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const hoy = new Date().toISOString().slice(0, 10);

            const [vencidos] = await conn.execute(`
                SELECT p.id_prestamo, p.fk_cliente, p.fecha_limite,
                       DATEDIFF(?, p.fecha_limite) AS dias_retraso
                FROM Prestamos p
                WHERE p.estado = 'Activo' AND p.fecha_limite < ?
            `, [hoy, hoy]);

            for (const prestamo of vencidos) {
                await conn.execute(
                    "UPDATE Prestamos SET estado = 'Vencido' WHERE id_prestamo = ?",
                    [prestamo.id_prestamo]
                );

                const monto = prestamo.dias_retraso * 1000;
                const descripcion = `Retraso de ${prestamo.dias_retraso} día(s) — Préstamo #${prestamo.id_prestamo}`;

                const [existentes] = await conn.execute(
                    'SELECT id_multa FROM Multa WHERE fk_cliente = ? AND estado = false',
                    [prestamo.fk_cliente]
                );

                let id_multa;
                if (existentes.length > 0) {
                    id_multa = existentes[0].id_multa;
                } else {
                    const [nuevaMulta] = await conn.execute(
                        'INSERT INTO Multa (fecha_multa, estado, total, fk_cliente) VALUES (?, false, 0, ?)',
                        [hoy, prestamo.fk_cliente]
                    );
                    id_multa = nuevaMulta.insertId;
                }

                // Ahora guarda fk_prestamo en el detalle
                await conn.execute(
                    'INSERT INTO DetalleMulta (fk_multa, tipo, descripcion, monto, fecha, fk_prestamo) VALUES (?, ?, ?, ?, ?, ?)',
                    [id_multa, 'retraso', descripcion, monto, hoy, prestamo.id_prestamo]
                );

                await conn.execute(
                    'UPDATE Multa SET total = (SELECT SUM(monto) FROM DetalleMulta WHERE fk_multa = ?) WHERE id_multa = ?',
                    [id_multa, id_multa]
                );
            }

            await conn.commit();
            console.log(`[CRON] ${vencidos.length} préstamo(s) vencido(s) procesados`);

        } catch (error) {
            await conn.rollback();
            console.error('[CRON] Error procesando vencidos:', error.message);
        } finally {
            conn.release();
        }
    }
}

module.exports = MultaService;