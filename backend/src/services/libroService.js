const pool = require('../config/db');
const {
  normalizeText,
  isNonEmptyString,
  isValidIsbn,
  isNonNegativeInteger,
  isPositiveInteger,
  normalizePagination,
  createValidationError,
} = require('../utils/validators');

const isValidImageUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && value.length <= 500;
  } catch {
    return false;
  }
};

class LibroService {
  static schemaReady = false;

  static async ensureSchema() {
    if (this.schemaReady) return;

    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'libro'
       AND COLUMN_NAME = 'imagen_url'`
    );

    if (columns.length === 0) {
      await pool.execute('ALTER TABLE libro ADD COLUMN imagen_url VARCHAR(500) NULL AFTER descripcion');
    }

    this.schemaReady = true;
  }

  static validarDatos(datos) {
    const isbn = normalizeText(datos.isbn);
    const titulo = normalizeText(datos.titulo);
    const autor = normalizeText(datos.autor) || null;
    const editorial = normalizeText(datos.editorial) || null;
    const descripcion = normalizeText(datos.descripcion) || null;
    const imagen_url = normalizeText(datos.imagen_url) || null;
    const stock = Number(datos.stock);
    const fk_categoria = Number(datos.fk_categoria);
    const fk_estante = Number(datos.fk_estante);

    if (!isValidIsbn(isbn)) {
      throw createValidationError('El ISBN debe tener 10 o 13 dígitos');
    }

    if (!isNonEmptyString(titulo) || titulo.length > 150) {
      throw createValidationError('El título es obligatorio y no puede superar 150 caracteres');
    }

    if (!isNonNegativeInteger(stock)) {
      throw createValidationError('El stock debe ser un número entero mayor o igual a 0');
    }

    if (!isPositiveInteger(fk_categoria) || !isPositiveInteger(fk_estante)) {
      throw createValidationError('Categoría y estante son obligatorios');
    }

    if (!isValidImageUrl(imagen_url)) {
      throw createValidationError('La URL de la imagen debe ser http/https y no superar 500 caracteres');
    }

    return { isbn, titulo, autor, editorial, descripcion, imagen_url, stock, fk_categoria, fk_estante };
  }

  static async obtenerTodos() {
    await this.ensureSchema();

    // soporta paginación: { limit, offset }
    const args = Array.from(arguments);
    let pagination = null;
    if (args[0] && typeof args[0] === 'object') {
      if (args[0].limit || args[0].offset) {
        pagination = normalizePagination(args[0].limit, args[0].offset);
      }
    }

    let sql = `
      SELECT l.*, c.nombre AS categoria, e.ubicacion AS estante
      FROM libro l
      JOIN categorias c ON l.fk_categoria = c.id_categoria
      JOIN estante e ON l.fk_estante = e.id_estante
    `;
    if (pagination) {
      sql += ` ORDER BY l.id_libro LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
    }

    const [libros] = await pool.execute(sql);
    return libros;
  }

  static async obtenerPorId(id) {
    await this.ensureSchema();

    const [libros] = await pool.execute('SELECT * FROM libro WHERE id_libro = ?', [id]);
    if (libros.length === 0) {
      const error = new Error('Libro no encontrado');
      error.status = 404;
      throw error;
    }
    return libros[0];
  }

  static async crear(datos) {
    await this.ensureSchema();

    const { isbn, titulo, autor, editorial, descripcion, imagen_url, stock, fk_categoria, fk_estante } = this.validarDatos(datos);
    const [resultado] = await pool.execute(
      `INSERT INTO libro (isbn, titulo, autor, editorial, descripcion, imagen_url, stock, fk_categoria, fk_estante)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [isbn, titulo, autor, editorial, descripcion, imagen_url, stock, fk_categoria, fk_estante]
    );
    return { id_libro: resultado.insertId, isbn, titulo, autor, editorial, descripcion, imagen_url, stock, fk_categoria, fk_estante };
  }

  static async actualizar(id, datos) {
    await this.ensureSchema();

    const { isbn, titulo, autor, editorial, descripcion, imagen_url, stock, fk_categoria, fk_estante } = this.validarDatos(datos);
    const [resultado] = await pool.execute(
      `UPDATE libro
       SET isbn = ?, titulo = ?, autor = ?, editorial = ?, descripcion = ?, imagen_url = ?, stock = ?, fk_categoria = ?, fk_estante = ?
       WHERE id_libro = ?`,
      [isbn, titulo, autor, editorial, descripcion, imagen_url, stock, fk_categoria, fk_estante, id]
    );
    if (resultado.affectedRows === 0) {
      const error = new Error('Libro no encontrado');
      error.status = 404;
      throw error;
    }
    return { id_libro: id, isbn, titulo, autor, editorial, descripcion, imagen_url, stock, fk_categoria, fk_estante };
  }

  static async eliminar(id) {
    const [resultado] = await pool.execute('DELETE FROM libro WHERE id_libro = ?', [id]);
    if (resultado.affectedRows === 0) {
      const error = new Error('Libro no encontrado');
      error.status = 404;
      throw error;
    }
    return { message: 'Libro eliminado correctamente' };
  }
}

module.exports = LibroService;
