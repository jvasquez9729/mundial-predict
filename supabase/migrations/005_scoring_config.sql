-- ============================================
-- Migración: Configuración de Sistema de Puntos
-- ============================================
-- Esta migración crea una tabla de configuración para el sistema de puntos
-- permitiendo ajustar los valores sin modificar el código.

-- ============================================
-- TABLA: scoring_config (singleton)
-- ============================================
CREATE TABLE IF NOT EXISTS scoring_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Puntos por predicción de partidos
  puntos_exacto INTEGER NOT NULL DEFAULT 3,        -- Marcador exacto
  puntos_resultado INTEGER NOT NULL DEFAULT 1,     -- Acertó ganador/empate
  puntos_fallido INTEGER NOT NULL DEFAULT 0,       -- No acertó

  -- Puntos por predicciones especiales
  puntos_campeon INTEGER NOT NULL DEFAULT 10,      -- Acertó campeón
  puntos_subcampeon INTEGER NOT NULL DEFAULT 5,    -- Acertó subcampeón
  puntos_goleador INTEGER NOT NULL DEFAULT 5,      -- Acertó goleador
  puntos_colombia_grupos INTEGER NOT NULL DEFAULT 2,   -- Colombia en grupos
  puntos_colombia_octavos INTEGER NOT NULL DEFAULT 3,  -- Colombia en octavos
  puntos_colombia_cuartos INTEGER NOT NULL DEFAULT 5,  -- Colombia en cuartos
  puntos_colombia_semifinal INTEGER NOT NULL DEFAULT 7, -- Colombia en semifinal
  puntos_colombia_final INTEGER NOT NULL DEFAULT 10,    -- Colombia en final
  puntos_colombia_campeon INTEGER NOT NULL DEFAULT 15,  -- Colombia campeón

  -- Configuración del pozo de premios
  inscripcion_valor INTEGER NOT NULL DEFAULT 100000, -- Valor de inscripción en COP
  premio_primero_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 55.00, -- % primer lugar
  premio_exactos_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 25.00, -- % más exactos
  premio_grupos_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 10.00,  -- % líder por grupos
  premio_reserva_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- % reserva/admin

  -- Metadata
  descripcion TEXT DEFAULT 'Configuración por defecto del Mundial 2026',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial si no existe
INSERT INTO scoring_config (descripcion)
SELECT 'Configuración Mundial 2026'
WHERE NOT EXISTS (SELECT 1 FROM scoring_config);

-- ============================================
-- FUNCIÓN: get_scoring_config
-- ============================================
-- Obtiene la configuración activa de puntos
CREATE OR REPLACE FUNCTION get_scoring_config()
RETURNS scoring_config AS $$
BEGIN
  RETURN (SELECT * FROM scoring_config WHERE activo = TRUE LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: calculate_prediction_points_v2
-- ============================================
-- Versión mejorada que usa la configuración de la tabla
CREATE OR REPLACE FUNCTION calculate_prediction_points_v2(
  pred_local INTEGER,
  pred_visitante INTEGER,
  real_local INTEGER,
  real_visitante INTEGER
) RETURNS TABLE(puntos INTEGER, es_exacto BOOLEAN) AS $$
DECLARE
  config scoring_config;
BEGIN
  SELECT * INTO config FROM scoring_config WHERE activo = TRUE LIMIT 1;

  -- Si no hay configuración, usar valores por defecto
  IF config IS NULL THEN
    config.puntos_exacto := 3;
    config.puntos_resultado := 1;
    config.puntos_fallido := 0;
  END IF;

  -- Marcador exacto
  IF pred_local = real_local AND pred_visitante = real_visitante THEN
    RETURN QUERY SELECT config.puntos_exacto, TRUE;
  -- Acertó ganador o empate
  ELSIF (pred_local > pred_visitante AND real_local > real_visitante) OR
        (pred_local < pred_visitante AND real_local < real_visitante) OR
        (pred_local = pred_visitante AND real_local = real_visitante) THEN
    RETURN QUERY SELECT config.puntos_resultado, FALSE;
  -- No acertó
  ELSE
    RETURN QUERY SELECT config.puntos_fallido, FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: update_prize_pool_v2
-- ============================================
-- Versión mejorada que usa la configuración de la tabla
CREATE OR REPLACE FUNCTION update_prize_pool_v2()
RETURNS TRIGGER AS $$
DECLARE
  config scoring_config;
  nuevo_total INTEGER;
  pozo INTEGER;
BEGIN
  SELECT * INTO config FROM scoring_config WHERE activo = TRUE LIMIT 1;

  -- Si no hay configuración, usar valores por defecto
  IF config IS NULL THEN
    config.inscripcion_valor := 100000;
    config.premio_primero_porcentaje := 55.00;
    config.premio_exactos_porcentaje := 25.00;
    config.premio_grupos_porcentaje := 10.00;
  END IF;

  SELECT COUNT(*) INTO nuevo_total FROM users WHERE es_admin = FALSE;
  pozo := nuevo_total * config.inscripcion_valor;

  UPDATE prize_pool SET
    total_usuarios = nuevo_total,
    pozo_total = pozo,
    premio_primero = FLOOR(pozo * (config.premio_primero_porcentaje / 100)),
    premio_exactos = FLOOR(pozo * (config.premio_exactos_porcentaje / 100)),
    premio_grupos = FLOOR(pozo * (config.premio_grupos_porcentaje / 100)),
    actualizado_en = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Actualizar timestamp al modificar config
-- ============================================
CREATE OR REPLACE FUNCTION update_scoring_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scoring_config_updated
BEFORE UPDATE ON scoring_config
FOR EACH ROW
EXECUTE FUNCTION update_scoring_config_timestamp();

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE scoring_config IS 'Configuración del sistema de puntos y premios';
COMMENT ON COLUMN scoring_config.puntos_exacto IS 'Puntos por acertar el marcador exacto';
COMMENT ON COLUMN scoring_config.puntos_resultado IS 'Puntos por acertar el resultado (ganador/empate)';
COMMENT ON COLUMN scoring_config.inscripcion_valor IS 'Valor de la inscripción en pesos colombianos';

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Las funciones originales (calculate_prediction_points, update_prize_pool)
-- siguen funcionando para compatibilidad. Para usar las nuevas funciones
-- con configuración dinámica, se deben actualizar los triggers:
--
-- DROP TRIGGER IF EXISTS on_user_registered ON users;
-- CREATE TRIGGER on_user_registered
--   AFTER INSERT ON users
--   FOR EACH ROW
--   WHEN (NEW.es_admin = FALSE)
--   EXECUTE FUNCTION update_prize_pool_v2();
--
-- Y actualizar las llamadas a calculate_prediction_points por
-- calculate_prediction_points_v2 en el código de la aplicación.
