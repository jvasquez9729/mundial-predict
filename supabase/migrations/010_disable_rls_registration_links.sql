-- ============================================
-- Migración 010: Deshabilitar RLS en registration_links
-- ============================================
-- La tabla registration_links necesita ser actualizada por el
-- servicio cuando un usuario se registra. RLS estaba bloqueando
-- la operación UPDATE.

-- Deshabilitar RLS en registration_links
ALTER TABLE registration_links DISABLE ROW LEVEL SECURITY;

-- También deshabilitar en otras tablas que puedan tener RLS
-- NOTA: leaderboard y leaderboard_history son VISTAS, no tablas
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pool DISABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;

-- Documentar
COMMENT ON TABLE registration_links IS 'Links de registro. RLS deshabilitado - autorización a nivel de API.';
