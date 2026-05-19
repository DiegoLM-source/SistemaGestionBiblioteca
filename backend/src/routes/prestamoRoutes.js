const express = require('express');
const router = express.Router();
const PrestamoController = require('../controllers/prestamoController');
const { autorizarRoles } = require('../middlewares/authMiddleware');

const ADMIN = 1;
const USUARIO = 2;

router.get('/solicitudes/me', autorizarRoles(USUARIO), PrestamoController.obtenerSolicitudesUsuario);
router.post('/solicitudes', autorizarRoles(USUARIO), PrestamoController.crearSolicitud);
router.get('/solicitudes', autorizarRoles(ADMIN), PrestamoController.obtenerSolicitudesAdmin);
router.patch('/solicitudes/:id/aprobar', autorizarRoles(ADMIN), PrestamoController.aprobarSolicitud);

router.get('/', autorizarRoles(ADMIN, USUARIO), PrestamoController.obtenerTodos);
router.get('/:id', autorizarRoles(ADMIN, USUARIO), PrestamoController.obtenerPorId);
router.post('/', autorizarRoles(ADMIN), PrestamoController.crear);
router.patch('/:id/estado', autorizarRoles(ADMIN, USUARIO), PrestamoController.cambiarEstado);
router.delete('/:id', autorizarRoles(ADMIN), PrestamoController.eliminar);

module.exports = router;
