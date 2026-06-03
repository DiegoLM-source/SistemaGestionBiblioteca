const fs = require('fs');

const OUTPUT_SQL = process.env.SEED_OUTPUT_SQL === '1';
const pool = OUTPUT_SQL ? null : require('../src/config/db');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n, w = 6) => String(n).padStart(w, '0');

const nombres = [
  'Ana', 'Pedro', 'María', 'Luis', 'Carla', 'Jorge', 'Lucía', 'Diego', 'Sofía', 'Andrés',
  'Valentina', 'Javier', 'Paula', 'Carlos', 'Marta', 'Ricardo', 'Laura', 'Felipe', 'Natalia', 'Raúl'
];

const apellidos = ['Gómez','Rodríguez','Pérez','López','Martínez','García','Santos','Morales','Ramos','Ramírez'];

const titulos = [
  'La casa vacía','El último viaje','Sombras del tiempo','Antes del amanecer','La promesa rota',
  'Caminos cruzados','Ecos del pasado','Un día cualquiera','El jardín secreto','Historias pequeñas'
];

const crearImagenLibro = (titulo, index) => {
  const texto = encodeURIComponent(titulo.replace(/\s+\d+$/, '').slice(0, 28));
  const color = ['070A26', '1F6F5B', '8A4F2D', '3D5A80', '5D576B'][index % 5];
  return `https://placehold.co/240x340/${color}/FFFFFF?text=${texto}`;
};

async function insertarEstantes(cant = 200) {
  console.log('Insertando estantes...');
  for (let i = 0; i < cant; i++) {
    const descripcion = `Estante ${i + 1}`;
    const ubicacion = `Ubicación ${rand(1, 50)}`;
    if (OUTPUT_SQL) {
      sqlStatements.push(`INSERT INTO estante (descripcion, ubicacion) VALUES (${escapeSql(descripcion)}, ${escapeSql(ubicacion)});`);
    } else {
      await pool.execute('INSERT INTO estante (descripcion, ubicacion) VALUES (?, ?)', [descripcion, ubicacion]);
    }
  }
}

async function insertarClientes(cant = 200) {
  console.log('Insertando clientes...');
  for (let i = 0; i < cant; i++) {
    const nombre = `${nombres[i % nombres.length]} ${apellidos[i % apellidos.length]} ${pad(i)}`;
    const correo = `user${Date.now().toString().slice(-4)}${i}@example.com`;
    const telefono = `3${rand(1000000, 9999999)}`;
    if (OUTPUT_SQL) {
      sqlStatements.push(`INSERT INTO cliente (nombre, correo, telefono) VALUES (${escapeSql(nombre)}, ${escapeSql(correo)}, ${escapeSql(telefono)});`);
    } else {
      await pool.execute('INSERT INTO cliente (nombre, correo, telefono) VALUES (?, ?, ?)', [nombre, correo, telefono]);
    }
  }
}

async function insertarLibros(cant = 200) {
  console.log('Insertando libros...');
  // asumimos que existe al menos una categoría (id_categoria = 1)
  const fk_categoria = 1;
  for (let i = 0; i < cant; i++) {
    const isbn = `978${String(1000000000 + i).padStart(10, '0')}`;
    const titulo = `${titulos[i % titulos.length]} ${pad(i)}`;
    const autor = `Autor ${pad(i % AUTHORS_COUNT)}`;
    const editorial = `Editorial ${rand(1,20)}`;
    const descripcion = `Descripción del libro ${i + 1}`;
    const imagen_url = crearImagenLibro(titulo, i);
    const stock = rand(1, 20);
    const fk_estante = rand(1, SHELVES_COUNT);
    try {
      if (OUTPUT_SQL) {
        sqlStatements.push(`INSERT INTO libro (isbn, titulo, autor, editorial, descripcion, imagen_url, stock, fk_categoria, fk_estante) VALUES (${escapeSql(isbn)}, ${escapeSql(titulo)}, ${escapeSql(autor)}, ${escapeSql(editorial)}, ${escapeSql(descripcion)}, ${escapeSql(imagen_url)}, ${stock}, ${fk_categoria}, ${fk_estante});`);
      } else {
        await pool.execute(
          'INSERT INTO libro (isbn, titulo, autor, editorial, descripcion, imagen_url, stock, fk_categoria, fk_estante) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [isbn, titulo, autor, editorial, descripcion, imagen_url, stock, fk_categoria, fk_estante]
        );
      }
    } catch (err) {
      // si hay conflicto de ISBN, generar otro
      i--; 
    }
  }
}

async function insertarPrestamos(cant = 200) {
  console.log('Insertando prestamos...');
  let usuarios = [7, 8];
  if (!OUTPUT_SQL) {
    const [rows] = await pool.execute('SELECT id_user FROM usuarios ORDER BY id_user');
    usuarios = rows.map((row) => row.id_user);
  }
  if (usuarios.length === 0) {
    throw new Error('No hay usuarios disponibles para crear préstamos');
  }
  for (let i = 0; i < cant; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - rand(0, 30));
    const fecha_limite = new Date(fecha);
    fecha_limite.setDate(fecha.getDate() + rand(7, 20));
    const estado = 'Activo';
    const fk_user = usuarios[i % usuarios.length];
    const fk_cliente = rand(1, CLIENTS_COUNT);
    if (OUTPUT_SQL) {
      sqlStatements.push(`INSERT INTO prestamos (fecha, fecha_limite, estado, fk_user, fk_cliente) VALUES (${escapeSql(fecha.toISOString().slice(0,10))}, ${escapeSql(fecha_limite.toISOString().slice(0,10))}, ${escapeSql(estado)}, ${fk_user}, ${fk_cliente});`);
    } else {
      await pool.execute('INSERT INTO prestamos (fecha, fecha_limite, estado, fk_user, fk_cliente) VALUES (?, ?, ?, ?, ?)', [fecha.toISOString().slice(0,10), fecha_limite.toISOString().slice(0,10), estado, fk_user, fk_cliente]);
    }
  }
}

async function insertarMultas(cant = 200) {
  console.log('Insertando multas y detalles...');
  for (let i = 0; i < cant; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - rand(0, 60));
    const fk_cliente = rand(1, CLIENTS_COUNT);
    if (OUTPUT_SQL) {
      sqlStatements.push(`INSERT INTO multa (fecha_multa, estado, total, fk_cliente) VALUES (${escapeSql(fecha.toISOString().slice(0,10))}, false, 0, ${fk_cliente});`);
      const idRef = `LAST_INSERT_ID()`; // placeholder; when importing SQL, rely on LAST_INSERT_ID usage
      const detalles = rand(1,3);
      let total = 0;
      for (let j = 0; j < detalles; j++) {
        const tipo = Math.random() < 0.8 ? 'retraso' : 'daño';
        const monto = rand(1000, 10000);
        total += monto;
        sqlStatements.push(`INSERT INTO detallemulta (fk_multa, tipo, descripcion, monto, fecha, fk_prestamo) VALUES (LAST_INSERT_ID(), ${escapeSql(tipo)}, ${escapeSql(`Detalle ${j+1}`)}, ${monto}, ${escapeSql(fecha.toISOString().slice(0,10))}, NULL);`);
      }
      sqlStatements.push(`UPDATE multa SET total = (SELECT SUM(monto) FROM detallemulta WHERE fk_multa = LAST_INSERT_ID()) WHERE id_multa = LAST_INSERT_ID();`);
    } else {
      const [res] = await pool.execute('INSERT INTO multa (fecha_multa, estado, total, fk_cliente) VALUES (?, false, 0, ?)', [fecha.toISOString().slice(0,10), fk_cliente]);
      const id_multa = res.insertId;
      const detalles = rand(1,3);
      let total = 0;
      for (let j = 0; j < detalles; j++) {
        const tipo = Math.random() < 0.8 ? 'retraso' : 'daño';
        const monto = rand(1000, 10000);
        total += monto;
        await pool.execute('INSERT INTO detallemulta (fk_multa, tipo, descripcion, monto, fecha, fk_prestamo) VALUES (?, ?, ?, ?, ?, NULL)', [id_multa, tipo, `Detalle ${j+1}`, monto, fecha.toISOString().slice(0,10)]);
      }
      await pool.execute('UPDATE multa SET total = ? WHERE id_multa = ?', [total, id_multa]);
    }
  }
}

async function main() {
  try {
    console.log('Iniciando seed...');
    // counts from env or defaults
    const USERS = Number(process.env.SEED_USERS || USERS_COUNT);
    const BOOKS = Number(process.env.SEED_BOOKS || BOOKS_COUNT);
    const SHELVES = Number(process.env.SEED_SHELVES || SHELVES_COUNT);
    const AUTHORS = Number(process.env.SEED_AUTHORS || AUTHORS_COUNT);
    const CLIENTS = Number(process.env.SEED_CLIENTS || CLIENTS_COUNT);
    const LOANS = Number(process.env.SEED_LOANS || LOANS_COUNT);
    const FINES = Number(process.env.SEED_FINES || FINES_COUNT);

    await insertarEstantes(SHELVES);
    await insertarClientes(CLIENTS);
    await insertarLibros(BOOKS);
    await insertarPrestamos(LOANS);
    await insertarMultas(FINES);

    if (OUTPUT_SQL) {
      const outPath = require('path').join(__dirname, 'seed_output.sql');
      fs.writeFileSync(outPath, sqlStatements.join('\n'));
      console.log('Archivo SQL generado en:', outPath);
    }

    console.log('Seed completado.');
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
}

// --- config defaults and SQL output mode ---
const USERS_COUNT = Number(process.env.SEED_USERS || 200);
const BOOKS_COUNT = Number(process.env.SEED_BOOKS || 500);
const SHELVES_COUNT = Number(process.env.SEED_SHELVES || 100);
const AUTHORS_COUNT = Number(process.env.SEED_AUTHORS || 100);
const CLIENTS_COUNT = Number(process.env.SEED_CLIENTS || 500);
const LOANS_COUNT = Number(process.env.SEED_LOANS || 200);
const FINES_COUNT = Number(process.env.SEED_FINES || 100);

const sqlStatements = [];

if (OUTPUT_SQL) {
  sqlStatements.push('ALTER TABLE libro ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500) NULL AFTER descripcion;');
}

const escapeSql = (s) => {
  if (s === null || s === undefined) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
};

main();
