const pool = require('../src/config/db');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n, w = 6) => String(n).padStart(w, '0');

const crearImagenLibro = (titulo, index) => {
  const texto = encodeURIComponent(titulo.replace(/\s+\d+$/, '').slice(0, 28));
  const color = ['070A26', '1F6F5B', '8A4F2D', '3D5A80', '5D576B'][index % 5];
  return `https://placehold.co/240x340/${color}/FFFFFF?text=${texto}`;
};

async function main() {
  try {
    console.log('Buscando libros sin imagen...');
    const [rows] = await pool.execute("SELECT id_libro, titulo FROM libro WHERE imagen_url IS NULL OR imagen_url = ''");
    if (rows.length === 0) {
      console.log('No se encontraron libros sin imagen.');
      process.exit(0);
    }

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const url = crearImagenLibro(r.titulo || `Libro_${r.id_libro}`, i);
      await pool.execute('UPDATE libro SET imagen_url = ? WHERE id_libro = ?', [url, r.id_libro]);
      if ((i + 1) % 50 === 0) console.log(`${i + 1} libros actualizados...`);
    }

    console.log(`Actualizadas ${rows.length} filas.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
