const pool = require('../config/db');

class LibroService {

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
        const { isbn, titulo, autor, editorial, descripcion, stock, fk_categoria, fk_estante } = datos;
        const [resultado] = await pool.execute(
            `INSERT INTO Libro (isbn, titulo, autor, editorial, descripcion, stock, fk_categoria, fk_estante)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [isbn, titulo, autor, editorial, descripcion, stock, fk_categoria, fk_estante]
        );

        if (datos.stock < 1) {
            const error = new Error('Stock no puede ser negativo');
            error.status = 404;
            throw error;
        }

        return { id_libro: resultado.insertId, ...datos };
    }

    static async actualizar(id, datos) {
        const { isbn, titulo, autor, editorial, descripcion, stock, fk_categoria, fk_estante } = datos;
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