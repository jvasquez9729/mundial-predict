-- ============================================
-- Migración 007: Deshabilitar RLS para autenticación custom
-- ============================================
-- La aplicación usa JWT custom en lugar de Supabase Auth.
-- Las políticas RLS que usan auth.uid() no funcionan porque
-- no hay sesión de Supabase Auth activa.
--
-- La autorización se maneja a nivel de aplicación en los
-- endpoints de API usando getSession() y verificando permisos.
-- ============================================

-- Eliminar políticas existentes que usan auth.uid()
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Predictions viewable by all" ON predictions;
DROP POLICY IF EXISTS "Predictions editable by owner" ON predictions;

-- Deshabilitar RLS en tablas afectadas
-- NOTA: La seguridad se mantiene a nivel de API
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE special_predictions DISABLE ROW LEVEL SECURITY;

-- Documentar la decisión
COMMENT ON TABLE users IS 'Usuarios registrados. Autorización manejada a nivel de API (getSession).';
COMMENT ON TABLE predictions IS 'Predicciones de partidos. Autorización manejada a nivel de API.';
COMMENT ON TABLE special_predictions IS 'Predicciones especiales (campeón, goleador, etc). Autorización manejada a nivel de API.';

-- ============================================
-- NOTA IMPORTANTE PARA DESARROLLADORES
-- ============================================
-- Si en el futuro se migra a Supabase Auth, se pueden
-- recrear las políticas RLS. Por ahora, asegúrate de que:
--
-- 1. Todos los endpoints de API validen la sesión con getSession()
-- 2. Los endpoints verifiquen que el usuario solo acceda a sus datos
-- 3. Los endpoints admin verifiquen es_admin = true
--
-- Ejemplo de patrón seguro en API:
--
--   const session = await getSession()
--   if (!session) return unauthorized()
--
--   // Para operaciones sobre datos propios:
--   if (data.user_id !== session.userId) return forbidden()
--
--   // Para operaciones admin:
--   if (!session.esAdmin) return forbidden()
-- ============================================
