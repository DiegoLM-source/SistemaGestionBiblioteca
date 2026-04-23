const express = require('express');
const app = require('./app');

const authRoutes = require('./routes/authRoutes');

app.use(express.json());

app.use('/api/auth', authRoutes);

app.listen(4000, () => {
    console.log('Servidor corriendo en puerto 4000');
});