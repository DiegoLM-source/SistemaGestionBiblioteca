const pool = require('../config/db');

class ClienteUsuarioService {
  static schemaReady = false;

  static async ensureSchema() {
    if (this.schemaReady) return;

    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'cliente'`
    );

    const columnNames = columns.map((c) => c.COLUMN_NAME);

    if (!columnNames.includes('fk_user')) {
      await pool.execute('ALTER TABLE cliente ADD COLUMN fk_user INT NULL AFTER telefono');
    }

    const [indexes] = await pool.execute(
      `SELECT INDEX_NAME
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'cliente'`
    );
    const indexNames = indexes.map((i) => i.INDEX_NAME);

    if (!indexNames.includes('uq_cliente_fk_user')) {
      await pool.execute('ALTER TABLE cliente ADD UNIQUE KEY uq_cliente_fk_user (fk_user)');
    }

    const [constraints] = await pool.execute(
      `SELECT CONSTRAINT_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'cliente'
       AND COLUMN_NAME = 'fk_user'
       AND REFERENCED_TABLE_NAME = 'usuarios'`
    );

    if (constraints.length === 0) {
      await pool.execute(`
        ALTER TABLE cliente
        ADD CONSTRAINT fk_cliente_usuario
        FOREIGN KEY (fk_user) REFERENCES usuarios (id_user)
        ON DELETE SET NULL
        ON UPDATE CASCADE
      `);
    }

    this.schemaReady = true;
  }

  static async getOrCreateClienteIdByUser(userId, username = null, correo = null) {
    await this.ensureSchema();

    const [existente] = await pool.execute(
      'SELECT id_cliente FROM cliente WHERE fk_user = ? LIMIT 1',
      [userId]
    );

    if (existente.length > 0) {
      return Number(existente[0].id_cliente);
    }

    const nombre = username || `Usuario ${userId}`;
    const [resultado] = await pool.execute(
      'INSERT INTO cliente (nombre, correo, telefono, fk_user) VALUES (?, ?, ?, ?)',
      [nombre, correo, null, userId]
    );

    return Number(resultado.insertId);
  }
}

module.exports = ClienteUsuarioService;
