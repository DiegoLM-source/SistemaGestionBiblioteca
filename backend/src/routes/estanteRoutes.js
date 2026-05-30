const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { autorizarRoles } = require('../middlewares/authMiddleware');

const ADMIN = 1;

router.use(autorizarRoles(ADMIN));

router.get('/', async (req, res) => {
    try {
        const limit = Number(req.query.limit || 100);
        const offset = Number(req.query.offset || 0);
        const [rows] = await pool.execute('SELECT * FROM estante ORDER BY id_estante LIMIT ? OFFSET ?', [limit, offset]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { descripcion, ubicacion } = req.body;
        if (!ubicacion) return res.status(400).json({ message: 'La ubicación es obligatoria' });
        const [resultado] = await pool.execute(
            'INSERT INTO estante (descripcion, ubicacion) VALUES (?, ?)',
            [descripcion, ubicacion]
        );
        res.status(201).json({ id_estante: resultado.insertId, descripcion, ubicacion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
