ALTER TABLE usuarios
  ADD COLUMN correo VARCHAR(100) NULL,
  ADD COLUMN google_id VARCHAR(100) NULL,
  ADD UNIQUE KEY uq_usuarios_correo (correo),
  ADD UNIQUE KEY uq_usuarios_google_id (google_id);
