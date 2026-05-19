const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/reservaController');
const { autorizarRoles } = require('../middlewares/authMiddleware');

const ADMIN = 1;

router.use(autorizarRoles(ADMIN));
router.get('/', ReservaController.obtenerTodas);
router.get('/:id', ReservaController.obtenerPorId);
router.post('/', ReservaController.crear);
router.patch('/:id/reclamar', ReservaController.reclamar);
router.patch('/:id/cancelar', ReservaController.cancelar);

module.exports = router;
