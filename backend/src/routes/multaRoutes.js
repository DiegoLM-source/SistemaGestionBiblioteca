const express = require('express');
const router = express.Router();
const MultaController = require('../controllers/multaController');

router.get('/', MultaController.obtenerTodos);
router.post('/', MultaController.crear);
router.patch('/:id/pagar', MultaController.marcarPagada);
router.delete('/:id', MultaController.eliminar);

module.exports = router;