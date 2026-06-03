Script para poblar `imagen_url` en la tabla `libro`

Uso:

1. Asegúrate de que las variables de conexión a la base de datos estén configuradas (usa la configuración existente en `src/config/db.js`).
2. Desde la carpeta `backend`, ejecuta:

```bash
node database/add_image_urls.js
```

El script actualizará todos los registros de `libro` que tengan `imagen_url` vacío o `NULL` usando imágenes de placeholder.

Ejecución automática al arrancar:

Si prefieres que el backend ejecute el rellenado automáticamente después del deploy, establece la variable de entorno `FILL_IMAGES_ON_STARTUP=1` en tu servicio (Railway/Render). Tras redeploy, el servidor ejecutará la operación una sola vez y registrará cuántos registros actualizó.
