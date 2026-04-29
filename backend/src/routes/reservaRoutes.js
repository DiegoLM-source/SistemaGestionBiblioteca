const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/reservaController');

router.get('/', ReservaController.obtenerTodas);
router.get('/:id', ReservaController.obtenerPorId);
router.post('/', ReservaController.crear);
router.patch('/:id/reclamar', ReservaController.reclamar);
router.patch('/:id/cancelar', ReservaController.cancelar);

module.exports = router;
