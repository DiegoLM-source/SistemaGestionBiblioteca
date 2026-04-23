const express = require('express');
const router = express.Router();
const PrestamoController = require('../controllers/prestamoController');

router.get('/', PrestamoController.obtenerTodos);
router.get('/:id', PrestamoController.obtenerPorId);
router.post('/', PrestamoController.crear);
router.patch('/:id/estado', PrestamoController.cambiarEstado);
router.delete('/:id', PrestamoController.eliminar);

module.exports = router;