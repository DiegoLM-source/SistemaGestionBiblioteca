const pool = require('../config/db');

const crearImagenLibro = (titulo, index) => {
  const texto = encodeURIComponent((titulo || '').replace(/\s+\d+$/, '').slice(0, 28));
  const color = ['070A26', '1F6F5B', '8A4F2D', '3D5A80', '5D576B'][index % 5];
  return `https://placehold.co/240x340/${color}/FFFFFF?text=${texto}`;
};

async function fillImages() {
  const [rows] = await pool.execute("SELECT id_libro, titulo FROM libro WHERE imagen_url IS NULL OR imagen_url = ''");
  if (!rows || rows.length === 0) return 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const url = crearImagenLibro(r.titulo || `Libro_${r.id_libro}`, i);
    await pool.execute('UPDATE libro SET imagen_url = ? WHERE id_libro = ?', [url, r.id_libro]);
  }

  return rows.length;
}

module.exports = { fillImages };
