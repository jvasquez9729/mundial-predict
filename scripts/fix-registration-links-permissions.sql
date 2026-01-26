-- Script para corregir permisos de registration_links
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- Opción 1: Deshabilitar RLS (RECOMENDADO)
-- ============================================
-- Como usamos SUPABASE_SERVICE_ROLE_KEY en el servidor,
-- no necesitamos RLS para esta tabla
ALTER TABLE registration_links DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'registration_links';

-- ============================================
-- Opción 2: Si prefieres mantener RLS habilitado,
-- crear políticas permisivas (NO EJECUTAR SI YA EJECUTASTE LA OPCIÓN 1)
-- ============================================
-- Descomentar solo si quieres mantener RLS habilitado:

-- ALTER TABLE registration_links ENABLE ROW LEVEL SECURITY;
-- 
-- -- Política permisiva que permite todo al service_role
-- CREATE POLICY IF NOT EXISTS "Allow all operations for service role" 
-- ON registration_links
-- FOR ALL
-- USING (true)
-- WITH CHECK (true);
-- 
-- -- Verificar políticas creadas
-- SELECT 
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies 
-- WHERE tablename = 'registration_links';

-- ============================================
-- Verificar permisos de la tabla
-- ============================================
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'registration_links'
AND grantee = 'service_role';

-- ============================================
-- Si service_role no tiene permisos, otorgarlos
-- ============================================
GRANT ALL ON registration_links TO service_role;
GRANT ALL ON registration_links TO anon;
GRANT ALL ON registration_links TO authenticated;

-- ============================================
-- Probar que el UPDATE funciona
-- ============================================
-- Primero, verifica que hay un registro
SELECT id, token, usado, usado_por 
FROM registration_links 
LIMIT 1;

-- Luego, prueba un UPDATE (reemplaza 'aqui-el-id' con un ID real)
-- UPDATE registration_links 
-- SET usado = true, usado_por = NULL 
-- WHERE id = 'aqui-el-id';
-- 
-- Si el UPDATE funciona sin errores, el problema está resuelto
