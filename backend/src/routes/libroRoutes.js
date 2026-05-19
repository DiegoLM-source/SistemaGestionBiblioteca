const express = require('express');
const router = express.Router();
const LibroController = require('../controllers/libroController');
const { autorizarRoles } = require('../middlewares/authMiddleware');

const ADMIN = 1;
const USUARIO = 2;

router.get('/', autorizarRoles(ADMIN, USUARIO), LibroController.obtenerTodos);
router.get('/:id', autorizarRoles(ADMIN, USUARIO), LibroController.obtenerPorId);
router.post('/', autorizarRoles(ADMIN), LibroController.crear);
router.put('/:id', autorizarRoles(ADMIN), LibroController.actualizar);
router.delete('/:id', autorizarRoles(ADMIN), LibroController.eliminar);

module.exports = router;
