-- 011_add_performance_indexes.sql
-- Índices para optimizar queries frecuentes (leaderboard, admin, predicciones).
-- NO modifica datos. NO toca RLS.
-- IF NOT EXISTS: idempotente si ya existen (p. ej. 001).
-- Reversible: ver comentarios al final para DROP.

-- matches(estado): filtros .eq('estado', 'proximo'|'finalizado')
CREATE INDEX IF NOT EXISTS idx_matches_estado ON matches(estado);

-- matches(fecha_hora): orden .order('fecha_hora')
CREATE INDEX IF NOT EXISTS idx_matches_fecha ON matches(fecha_hora);

-- predictions(user_id): lookups por usuario
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);

-- predictions(match_id): lookups por partido
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);

-- Reversión (ejecutar manualmente si se deshace la migración):
-- DROP INDEX IF EXISTS idx_matches_estado;
-- DROP INDEX IF EXISTS idx_matches_fecha;
-- DROP INDEX IF EXISTS idx_predictions_user;
-- DROP INDEX IF EXISTS idx_predictions_match;
