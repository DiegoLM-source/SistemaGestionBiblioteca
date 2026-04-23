const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Estante');
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
            'INSERT INTO Estante (descripcion, ubicacion) VALUES (?, ?)',
            [descripcion, ubicacion]
        );
        res.status(201).json({ id_estante: resultado.insertId, descripcion, ubicacion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;