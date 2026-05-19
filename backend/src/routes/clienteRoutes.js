const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/clienteController');
const { autorizarRoles } = require('../middlewares/authMiddleware');

const ADMIN = 1;

router.use(autorizarRoles(ADMIN));

router.get('/', ClienteController.obtenerTodos);
router.get('/:id', ClienteController.obtenerPorId);
router.post('/', ClienteController.crear);
router.put('/:id', ClienteController.actualizar);
router.delete('/:id', ClienteController.eliminar);

module.exports = router;
