const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const libroRoutes = require('./routes/libroRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const prestamoRoutes = require('./routes/prestamoRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const estanteRoutes   = require('./routes/estanteRoutes');
const multaRoutes = require('./routes/multaRoutes');
const cron = require('node-cron');
const MultaService = require('./services/multaService');
const errorHandler = require('./middlewares/errorHandler');
const { verificarToken } = require('./middlewares/authMiddleware');

const app = express();
const procesarPrestamosVencidos = async () => {
    console.log('[CRON] Procesando préstamos vencidos...');
    await MultaService.procesarVencidos();
};

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.get('/api/health', (req, res) => {
    res.status(200).json({
        sucess: true,
        message: 'Servidor logistico operando correctamente',
        timestamp: new Date().toISOString()
    });
});

setImmediate(() => {
    procesarPrestamosVencidos().catch((error) => {
        console.error('[CRON] Error inicial procesando vencidos:', error.message);
    });
});

cron.schedule('0 * * * *', async () => {
    await procesarPrestamosVencidos();
});

app.use('/api/auth', authRoutes);
app.use('/api/libros', verificarToken, libroRoutes);
app.use('/api/clientes', verificarToken, clienteRoutes);
app.use('/api/prestamos', verificarToken, prestamoRoutes);
app.use('/api/reservas', verificarToken, reservaRoutes);
app.use('/api/categorias', verificarToken, categoriaRoutes);
app.use('/api/estantes', verificarToken, estanteRoutes);
app.use('/api/multas', verificarToken, multaRoutes);
app.use(errorHandler);
module.exports = app;
