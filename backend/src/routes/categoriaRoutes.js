const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Categorias');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) return res.status(400).json({ message: 'El nombre es obligatorio' });
        const [resultado] = await pool.execute(
            'INSERT INTO Categorias (nombre) VALUES (?)', [nombre]
        );
        res.status(201).json({ id_categoria: resultado.insertId, nombre });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;