ALTER TABLE reserva
  ADD COLUMN fecha_reclamo DATE NULL AFTER fecha_reserva,
  ADD COLUMN fk_prestamo INT NULL AFTER fk_libro,
  ADD KEY fk_reserva_prestamo (fk_prestamo),
  ADD CONSTRAINT fk_reserva_prestamo
    FOREIGN KEY (fk_prestamo) REFERENCES prestamos (id_prestamo)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
