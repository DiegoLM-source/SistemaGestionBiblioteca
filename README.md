# SGB-Diego
Proyecto para Bases de Datos

## Login con Google (OAuth2)

### 1) Configurar credenciales en Google Cloud
- En Google Cloud Console ve a **APIs y servicios > Pantalla de consentimiento OAuth** y configura la app.
- Crea un cliente OAuth 2.0 tipo **Aplicación web**.
- Registra estos URIs:
  - **Authorized redirect URI**: `http://localhost:4000/api/auth/google/callback`
  - **Authorized JavaScript origin**: `http://localhost:5173`
- Copia `Client ID` y `Client Secret`.

### 2) Variables de entorno
- Backend: copia `backend/.env.example` a `backend/.env` y completa valores.
- Frontend: copia `frontend/.env.example` a `frontend/.env`.

### 3) Ajuste en base de datos
- Ejecuta la migración `backend/database/migrations/2026-04-28_google_auth.sql`.
- Esto agrega `correo` y `google_id` en la tabla `usuarios`.

### 4) Flujo implementado
- Frontend llama `GET /api/auth/google` al presionar **Continuar con Google**.
- Backend redirige al consent screen de Google.
- Google regresa a `GET /api/auth/google/callback?code=...`.
- Backend valida el `id_token`, crea/actualiza usuario y genera JWT.
- Backend redirige al frontend en `/auth/google/callback?token=...`.
- Frontend guarda `token` en `localStorage` y navega al dashboard.
