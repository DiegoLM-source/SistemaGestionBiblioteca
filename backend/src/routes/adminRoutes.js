const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { autorizarRoles } = require('../middlewares/authMiddleware');

const ADMIN = 1;

router.post('/fill-images', autorizarRoles(ADMIN), AdminController.fillImages);

module.exports = router;
