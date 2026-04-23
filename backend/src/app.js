const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const libroRoutes = require('./routes/libroRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const prestamoRoutes = require('./routes/prestamoRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const estanteRoutes   = require('./routes/estanteRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

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

app.use(errorHandler);
app.use('/api/auth', authRoutes);
app.use('/api/libros', libroRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/prestamos', prestamoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/estantes',   estanteRoutes);

module.exports = app;