const express = require('express');
const router = express.Router();
const MultaController = require('../controllers/multaController');
const { autorizarRoles } = require('../middlewares/authMiddleware');

const ADMIN = 1;
const USUARIO = 2;

router.get('/', autorizarRoles(ADMIN, USUARIO), MultaController.obtenerTodos);
router.post('/', autorizarRoles(ADMIN), MultaController.crear);
router.patch('/:id/pagar', autorizarRoles(ADMIN, USUARIO), MultaController.marcarPagada);
router.delete('/:id', autorizarRoles(ADMIN), MultaController.eliminar);

module.exports = router;
