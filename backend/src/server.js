const app = require('./app');

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
