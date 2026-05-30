const mysql = require('mysql2/promise');
require('dotenv').config();

let dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST,
  user: process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASS,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DB,
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Soporte para DATABASE_URL (Railway)
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    dbConfig = {
      host: url.hostname,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname ? url.pathname.replace(/^\//, '') : undefined,
      port: Number(url.port) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };
  } catch (err) {
    console.warn('DATABASE_URL no válida, usando variables separadas.');
  }
}

const pool = mysql.createPool(dbConfig);

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a la base de datos establecida.');
    connection.release();
  } catch (error) {
    console.error('Error al conectar a la base de datos:');
    console.error('Config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
    });
    console.error('Detalle:', error?.message || error);
    process.exit(1);
  }
})();

module.exports = pool;
