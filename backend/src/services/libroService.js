const pool = require('../config/db');
const {
    normalizeText,
    isNonEmptyString,
    isValidIsbn,
    isNonNegativeInteger,
    isPositiveInteger,
    createValidationError
} = require('../utils/validators');

class LibroService {
    static validarDatos(datos) {
        const isbn = normalizeText(datos.isbn);
        const titulo = normalizeText(datos.titulo);
        const autor = normalizeText(datos.autor) || null;
        const editorial = normalizeText(datos.editorial) || null;
        const descripcion = normalizeText(datos.descripcion) || null;
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

        return { isbn, titulo, autor, editorial, descripcion, stock, fk_categoria, fk_estante };
    }

    static async obtenerTodos() {
        const [libros] = await pool.execute(`
            SELECT l.*, c.nombre AS categoria, e.ubicacion AS estante
            FROM Libro l
            JOIN Categorias c ON l.fk_categoria = c.id_categoria
            JOIN Estante e ON l.fk_estante = e.id_estante
        `);
        return libros;
    }

    static async obtenerPorId(id) {
        const [libros] = await pool.execute(
            'SELECT * FROM Libro WHERE id_libro = ?', [id]
        );
        if (libros.length === 0) {
            const error = new Error('Libro no encontrado');
            error.status = 404;
            throw error;
        }
        return libros[0];
    }

    static async crear(datos) {
        const { isbn, titulo, autor, editorial, descripcion, stock, fk_categoria, fk_estante } = this.validarDatos(datos);
        const [resultado] = await pool.execute(
            `INSERT INTO Libro (isbn, titulo, autor, editorial, descripcion, stock, fk_categoria, fk_estante)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [isbn, titulo, autor, editorial, descripcion, stock, fk_categoria, fk_estante]
        );
        return { id_libro: resultado.insertId, isbn, titulo, autor, editorial, descripcion, stock, fk_categoria, fk_estante };
    }

    static async actualizar(id, datos) {
        const { isbn, titulo, autor, editorial, descripcion, stock, fk_categoria, fk_estante } = this.validarDatos(datos);
        const [resultado] = await pool.execute(
            `UPDATE Libro SET isbn=?, titulo=?, autor=?, editorial=?, descripcion=?, stock=?, fk_categoria=?, fk_estante=?
             WHERE id_libro=?`,
            [isbn, titulo, autor, editorial, descripcion, stock, fk_categoria, fk_estante, id]
        );
        if (resultado.affectedRows === 0) {
            const error = new Error('Libro no encontrado');
            error.status = 404;
            throw error;
        }
        return { id_libro: id, ...datos };
    }

    static async eliminar(id) {
        const [resultado] = await pool.execute(
            'DELETE FROM Libro WHERE id_libro = ?', [id]
        );
        if (resultado.affectedRows === 0) {
            const error = new Error('Libro no encontrado');
            error.status = 404;
            throw error;
        }
        return { message: 'Libro eliminado correctamente' };
    }
}

module.exports = LibroService;
