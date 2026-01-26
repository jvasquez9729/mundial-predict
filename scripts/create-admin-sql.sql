-- Script SQL para crear el primer usuario administrador
-- Ejecutar en Supabase SQL Editor
--
-- IMPORTANTE: Reemplaza los valores entre <> con tus datos reales
-- Luego ejecuta el script completo

-- Paso 1: Crea una función para hashear la contraseña (bcrypt)
-- Nota: Este ejemplo usa una contraseña ya hasheada
-- Para obtener el hash, usa: node -e "const bcrypt=require('bcryptjs');bcrypt.hash('TU_CONTRASEÑA',12).then(h=>console.log(h))"

-- Ejemplo: Crear usuario admin con email admin@mundial.com y contraseña "admin123"
-- Reemplaza estos valores con los tuyos

DO $$
DECLARE
  v_password_hash TEXT;
  v_user_id UUID;
BEGIN
  -- Generar hash de contraseña (reemplaza 'tu_contraseña_aqui' con tu contraseña)
  -- Nota: En producción, hashea la contraseña primero usando bcrypt con 12 salt rounds
  -- Ejemplo usando bcrypt en Node.js:
  -- const bcrypt = require('bcryptjs');
  -- bcrypt.hash('tu_contraseña', 12).then(hash => console.log(hash));
  
  -- Por ahora, usaré una contraseña de ejemplo hasheada
  -- DEBES REEMPLAZAR ESTE HASH con el hash real de tu contraseña
  -- v_password_hash := '$2a$12$EjemploHashAquiReemplazarConElHashReal'; -- REEMPLAZAR
  
  -- Insertar usuario admin
  INSERT INTO users (
    nombre_completo,
    cedula,
    email,
    celular,
    password_hash,
    es_admin
  ) VALUES (
    'Admin Mundial 2026',           -- Reemplaza con tu nombre
    '1234567890',                   -- Reemplaza con tu cédula
    'admin@mundial.com',            -- Reemplaza con tu email
    '3001234567',                   -- Reemplaza con tu celular
    '$2a$12$EjemploHashAquiReemplazarConElHashReal', -- REEMPLAZAR con hash real
    TRUE
  )
  RETURNING id INTO v_user_id;
  
  RAISE NOTICE '✅ Usuario administrador creado con ID: %', v_user_id;
  
  -- Crear registro de predicciones especiales
  INSERT INTO special_predictions (user_id) VALUES (v_user_id);
  
  RAISE NOTICE '✅ Registro de predicciones especiales creado';
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE '⚠️ Error: Ya existe un usuario con ese email, cédula o celular';
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;

-- Para verificar que se creó correctamente:
-- SELECT id, nombre_completo, email, es_admin, creado_en FROM users WHERE es_admin = TRUE;
