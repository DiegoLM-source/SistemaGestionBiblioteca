const express = require('express');
const router = express.Router();
const LibroController = require('../controllers/libroController');

router.get('/', LibroController.obtenerTodos);
router.get('/:id', LibroController.obtenerPorId);
router.post('/', LibroController.crear);
router.put('/:id', LibroController.actualizar);
router.delete('/:id', LibroController.eliminar);

module.exports = router;