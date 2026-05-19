const pool = require('../config/db');
const {
  isValidDate,
  isPositiveInteger,
  getCurrentDateString,
  createValidationError,
} = require('../utils/validators');
const ClienteUsuarioService = require('./clienteUsuarioService');

class PrestamoService {
  static schemaReady = false;

  static async ensureSolicitudesSchema() {
    if (this.schemaReady) return;

    await ClienteUsuarioService.ensureSchema();

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS solicitud_prestamo (
        id_solicitud INT NOT NULL AUTO_INCREMENT,
        fecha_solicitud DATE NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
        fecha_recogida DATE NULL,
        cantidad INT NOT NULL DEFAULT 1,
        fk_cliente INT NOT NULL,
        fk_libro INT NOT NULL,
        fk_reserva INT NULL,
        PRIMARY KEY (id_solicitud),
        KEY fk_solicitud_cliente (fk_cliente),
        KEY fk_solicitud_libro (fk_libro),
        KEY fk_solicitud_reserva (fk_reserva),
        CONSTRAINT fk_solicitud_cliente FOREIGN KEY (fk_cliente) REFERENCES cliente(id_cliente)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_solicitud_libro FOREIGN KEY (fk_libro) REFERENCES libro(id_libro)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_solicitud_reserva FOREIGN KEY (fk_reserva) REFERENCES reserva(id_reserva)
          ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    this.schemaReady = true;
  }

  static validarCreacion(datos) {
    const { fecha, fecha_limite, fk_user, fk_cliente, libros } = datos;

    if (!isValidDate(fecha) || !isValidDate(fecha_limite)) {
      throw createValidationError('Las fechas del préstamo no son válidas');
    }

    const hoy = getCurrentDateString();

    if (fecha_limite < hoy) {
      throw createValidationError('La fecha de devolución no puede ser anterior a la fecha actual');
    }

    if (new Date(fecha_limite) < new Date(fecha)) {
      throw createValidationError('La fecha límite no puede ser anterior a la fecha del préstamo');
    }

    if (!isPositiveInteger(fk_user) || !isPositiveInteger(fk_cliente)) {
      throw createValidationError('Usuario y cliente son obligatorios');
    }

    if (!Array.isArray(libros) || libros.length === 0) {
      throw createValidationError('Debes seleccionar al menos un libro');
    }

    const ids = new Set();
    for (const item of libros) {
      const idLibro = Number(item.id_libro);
      const cantidad = Number(item.cantidad);

      if (!isPositiveInteger(idLibro) || !isPositiveInteger(cantidad)) {
        throw createValidationError('Cada libro debe tener un id válido y una cantidad mayor a 0');
      }

      if (ids.has(idLibro)) {
        throw createValidationError('No puedes repetir el mismo libro en un préstamo');
      }

      ids.add(idLibro);
    }
  }

  static async obtenerTodos({ rol, userId }) {
    const params = [];
    let where = '';

    if (Number(rol) === 2) {
      where = 'WHERE c.fk_user = ?';
      params.push(userId);
    }

    const [prestamos] = await pool.execute(
      `SELECT
         p.id_prestamo,
         p.fecha,
         p.fecha_limite,
         p.estado,
         p.fk_cliente,
         c.nombre AS cliente_nombre,
         c.telefono AS cliente_telefono,
         GROUP_CONCAT(CONCAT(l.titulo, ' (x', dp.cantidad, ')') SEPARATOR ', ') AS libros
       FROM prestamos p
       JOIN cliente c ON p.fk_cliente = c.id_cliente
       LEFT JOIN detalleprestamo dp ON dp.fk_prestamo = p.id_prestamo
       LEFT JOIN libro l ON l.id_libro = dp.fk_libro
       ${where}
       GROUP BY p.id_prestamo
       ORDER BY p.fecha DESC`,
      params
    );

    return prestamos;
  }

  static async obtenerPorId(id, { rol, userId }) {
    const params = [id];
    let whereUser = '';

    if (Number(rol) === 2) {
      whereUser = 'AND c.fk_user = ?';
      params.push(userId);
    }

    const [prestamos] = await pool.execute(
      `SELECT p.*, c.nombre AS cliente_nombre, c.telefono AS cliente_telefono
       FROM prestamos p
       JOIN cliente c ON p.fk_cliente = c.id_cliente
       WHERE p.id_prestamo = ? ${whereUser}`,
      params
    );

    if (prestamos.length === 0) {
      const error = new Error('Préstamo no encontrado');
      error.status = 404;
      throw error;
    }

    const [detalles] = await pool.execute(
      `SELECT dp.*, l.titulo, l.stock
       FROM detalleprestamo dp
       JOIN libro l ON l.id_libro = dp.fk_libro
       WHERE dp.fk_prestamo = ?`,
      [id]
    );

    return { ...prestamos[0], detalles };
  }

  static async crear(datos) {
    this.validarCreacion(datos);

    const { fecha, fecha_limite, fk_user, fk_cliente, libros } = datos;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [activos] = await conn.execute(
        `SELECT id_prestamo FROM prestamos
         WHERE fk_cliente = ? AND estado = 'Activo'`,
        [fk_cliente]
      );
      if (activos.length > 0) {
        const error = new Error('El cliente ya tiene un préstamo activo');
        error.status = 400;
        throw error;
      }

      for (const item of libros) {
        const [rows] = await conn.execute('SELECT titulo, stock FROM libro WHERE id_libro = ?', [item.id_libro]);
        if (rows.length === 0) {
          const error = new Error(`Libro con id ${item.id_libro} no encontrado`);
          error.status = 404;
          throw error;
        }
        if (rows[0].stock < item.cantidad || item.cantidad <= 0) {
          const error = new Error(`Stock insuficiente para "${rows[0].titulo}". Disponible: ${rows[0].stock}`);
          error.status = 400;
          throw error;
        }
      }

      const [resultado] = await conn.execute(
        `INSERT INTO prestamos (fecha, fecha_limite, estado, fk_user, fk_cliente)
         VALUES (?, ?, 'Activo', ?, ?)`,
        [fecha, fecha_limite, fk_user, fk_cliente]
      );
      const id_prestamo = resultado.insertId;

      for (const item of libros) {
        await conn.execute(
          `INSERT INTO detalleprestamo (fk_libro, fk_prestamo, cantidad, estado)
           VALUES (?, ?, ?, 'Activo')`,
          [item.id_libro, id_prestamo, item.cantidad]
        );
        await conn.execute('UPDATE libro SET stock = stock - ? WHERE id_libro = ?', [item.cantidad, item.id_libro]);
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

  static async crearSolicitud({ userId, id_libro, cantidad = 1 }) {
    await this.ensureSolicitudesSchema();

    const libroId = Number(id_libro);
    const cant = Number(cantidad);

    if (!isPositiveInteger(userId) || !isPositiveInteger(libroId) || !isPositiveInteger(cant)) {
      throw createValidationError('Datos inválidos para la solicitud');
    }

    const fk_cliente = await ClienteUsuarioService.getOrCreateClienteIdByUser(userId);

    const [libros] = await pool.execute('SELECT id_libro, titulo FROM libro WHERE id_libro = ?', [libroId]);
    if (libros.length === 0) {
      const error = new Error('Libro no encontrado');
      error.status = 404;
      throw error;
    }

    const [pendientes] = await pool.execute(
      `SELECT id_solicitud
       FROM solicitud_prestamo
       WHERE fk_cliente = ? AND fk_libro = ? AND estado IN ('Pendiente', 'Aprobada')`,
      [fk_cliente, libroId]
    );

    if (pendientes.length > 0) {
      throw createValidationError('Ya tienes una solicitud pendiente o aprobada para este libro');
    }

    const [resultado] = await pool.execute(
      `INSERT INTO solicitud_prestamo (fecha_solicitud, estado, fecha_recogida, cantidad, fk_cliente, fk_libro)
       VALUES (CURDATE(), 'Pendiente', NULL, ?, ?, ?)`,
      [cant, fk_cliente, libroId]
    );

    return { id_solicitud: resultado.insertId, message: 'Solicitud enviada al administrador' };
  }

  static async obtenerSolicitudesAdmin() {
    await this.ensureSolicitudesSchema();

    const [solicitudes] = await pool.execute(
      `SELECT
         s.id_solicitud,
         s.fecha_solicitud,
         s.fecha_recogida,
         s.estado,
         s.cantidad,
         s.fk_cliente,
         s.fk_libro,
         s.fk_reserva,
         c.nombre AS cliente_nombre,
         c.telefono AS cliente_telefono,
         l.titulo AS libro_titulo,
         l.autor AS libro_autor
       FROM solicitud_prestamo s
       JOIN cliente c ON c.id_cliente = s.fk_cliente
       JOIN libro l ON l.id_libro = s.fk_libro
       ORDER BY s.fecha_solicitud DESC, s.id_solicitud DESC`
    );

    return solicitudes;
  }

  static async obtenerSolicitudesUsuario(userId) {
    await this.ensureSolicitudesSchema();

    const [solicitudes] = await pool.execute(
      `SELECT
         s.id_solicitud,
         s.fecha_solicitud,
         s.fecha_recogida,
         s.estado,
         s.cantidad,
         s.fk_reserva,
         l.titulo AS libro_titulo,
         l.autor AS libro_autor
       FROM solicitud_prestamo s
       JOIN cliente c ON c.id_cliente = s.fk_cliente
       JOIN libro l ON l.id_libro = s.fk_libro
       WHERE c.fk_user = ?
       ORDER BY s.fecha_solicitud DESC, s.id_solicitud DESC`,
      [userId]
    );

    return solicitudes;
  }

  static async aprobarSolicitud(id_solicitud, fecha_recogida) {
    await this.ensureSolicitudesSchema();

    if (!isValidDate(fecha_recogida)) {
      throw createValidationError('La fecha de recogida no es válida');
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [solicitudes] = await conn.execute(
        `SELECT *
         FROM solicitud_prestamo
         WHERE id_solicitud = ?
         FOR UPDATE`,
        [id_solicitud]
      );

      if (solicitudes.length === 0) {
        const error = new Error('Solicitud no encontrada');
        error.status = 404;
        throw error;
      }

      const solicitud = solicitudes[0];

      if (solicitud.estado !== 'Pendiente') {
        throw createValidationError('Solo se pueden aprobar solicitudes pendientes');
      }

      const [libros] = await conn.execute(
        'SELECT id_libro, stock, titulo FROM libro WHERE id_libro = ? FOR UPDATE',
        [solicitud.fk_libro]
      );

      if (libros.length === 0) {
        const error = new Error('Libro no encontrado');
        error.status = 404;
        throw error;
      }

      if (libros[0].stock < solicitud.cantidad) {
        throw createValidationError(`Stock insuficiente para "${libros[0].titulo}"`);
      }

      const [reservaResultado] = await conn.execute(
        `INSERT INTO reserva (fecha_reserva, fecha_reclamo, estado, fk_cliente, fk_libro)
         VALUES (CURDATE(), ?, 'Reservado', ?, ?)`,
        [fecha_recogida, solicitud.fk_cliente, solicitud.fk_libro]
      );

      await conn.execute('UPDATE libro SET stock = stock - ? WHERE id_libro = ?', [solicitud.cantidad, solicitud.fk_libro]);

      await conn.execute(
        `UPDATE solicitud_prestamo
         SET estado = 'Aprobada', fecha_recogida = ?, fk_reserva = ?
         WHERE id_solicitud = ?`,
        [fecha_recogida, reservaResultado.insertId, id_solicitud]
      );

      await conn.commit();
      return {
        message: 'Solicitud aprobada y convertida en reserva',
        id_reserva: reservaResultado.insertId,
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async cambiarEstado(id, estado) {
    if (!['Devuelto'].includes(estado)) {
      throw createValidationError('El estado enviado no es válido');
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [resultado] = await conn.execute('UPDATE prestamos SET estado = ? WHERE id_prestamo = ?', [estado, id]);
      if (resultado.affectedRows === 0) {
        const error = new Error('Préstamo no encontrado');
        error.status = 404;
        throw error;
      }

      if (estado === 'Devuelto') {
        const [detalles] = await conn.execute('SELECT fk_libro, cantidad FROM detalleprestamo WHERE fk_prestamo = ?', [id]);
        for (const d of detalles) {
          await conn.execute('UPDATE libro SET stock = stock + ? WHERE id_libro = ?', [d.cantidad, d.fk_libro]);
        }
        await conn.execute(
          `UPDATE detalleprestamo
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
      const [prestamos] = await pool.execute('SELECT estado FROM prestamos WHERE id_prestamo = ?', [id]);

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

      await pool.execute('DELETE FROM prestamos WHERE id_prestamo = ?', [id]);

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
