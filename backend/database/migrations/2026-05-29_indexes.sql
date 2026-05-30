-- Indexes to improve search performance for small-to-medium datasets
ALTER TABLE cliente ADD INDEX idx_cliente_nombre (nombre);
ALTER TABLE libro ADD INDEX idx_libro_titulo (titulo(100));
ALTER TABLE multa ADD INDEX idx_multa_fecha (fecha_multa);
