-- Migración: Hacer cédula opcional y actualizar constraints
-- Permite que los usuarios se registren sin cédula

-- Eliminar el constraint UNIQUE de cédula (ya que puede ser NULL)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_cedula_key;

-- Hacer cédula nullable (opcional)
ALTER TABLE users ALTER COLUMN cedula DROP NOT NULL;

-- Crear un índice único parcial para cédulas no nulas
-- Esto permite múltiples NULLs pero mantiene unicidad para valores no nulos
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cedula_unique 
ON users(cedula) 
WHERE cedula IS NOT NULL;

-- Actualizar el índice existente para que funcione con valores NULL
DROP INDEX IF EXISTS idx_users_cedula;
CREATE INDEX IF NOT EXISTS idx_users_cedula ON users(cedula) WHERE cedula IS NOT NULL;
