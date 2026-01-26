-- ============================================
-- Migración 009: Corregir migraciones faltantes
-- ============================================
-- Este script aplica las partes faltantes de las migraciones 005, 006 y 008
-- Ejecutar en Supabase Dashboard → SQL Editor

-- ============================================
-- PARTE 1: scoring_config (de migración 005)
-- ============================================
CREATE TABLE IF NOT EXISTS scoring_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Puntos por predicción de partidos
  puntos_exacto INTEGER NOT NULL DEFAULT 3,
  puntos_resultado INTEGER NOT NULL DEFAULT 1,
  puntos_fallido INTEGER NOT NULL DEFAULT 0,

  -- Puntos por predicciones especiales
  puntos_campeon INTEGER NOT NULL DEFAULT 10,
  puntos_subcampeon INTEGER NOT NULL DEFAULT 5,
  puntos_goleador INTEGER NOT NULL DEFAULT 5,
  puntos_colombia_grupos INTEGER NOT NULL DEFAULT 2,
  puntos_colombia_octavos INTEGER NOT NULL DEFAULT 3,
  puntos_colombia_cuartos INTEGER NOT NULL DEFAULT 5,
  puntos_colombia_semifinal INTEGER NOT NULL DEFAULT 7,
  puntos_colombia_final INTEGER NOT NULL DEFAULT 10,
  puntos_colombia_campeon INTEGER NOT NULL DEFAULT 15,

  -- Configuración del pozo de premios
  inscripcion_valor INTEGER NOT NULL DEFAULT 100000,
  premio_primero_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 55.00,
  premio_exactos_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 25.00,
  premio_grupos_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  premio_reserva_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 10.00,

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

-- Función para obtener configuración activa
CREATE OR REPLACE FUNCTION get_scoring_config()
RETURNS scoring_config AS $$
BEGIN
  RETURN (SELECT * FROM scoring_config WHERE activo = TRUE LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION update_scoring_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS scoring_config_updated ON scoring_config;
CREATE TRIGGER scoring_config_updated
BEFORE UPDATE ON scoring_config
FOR EACH ROW
EXECUTE FUNCTION update_scoring_config_timestamp();

-- ============================================
-- PARTE 2: push_subscriptions.actualizado_en (de migración 006)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'push_subscriptions' AND column_name = 'actualizado_en'
    ) THEN
        ALTER TABLE push_subscriptions ADD COLUMN actualizado_en TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Trigger para actualizado_en en push_subscriptions
CREATE OR REPLACE FUNCTION update_push_subscription_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_push_subscription_actualizado_en ON push_subscriptions;
CREATE TRIGGER trigger_push_subscription_actualizado_en
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscription_actualizado_en();

-- ============================================
-- PARTE 3: special_predictions.actualizado_en (de migración 008)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'special_predictions' AND column_name = 'actualizado_en'
    ) THEN
        ALTER TABLE special_predictions ADD COLUMN actualizado_en TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- ============================================
-- PARTE 4: Función genérica y triggers (de migración 008)
-- ============================================
CREATE OR REPLACE FUNCTION update_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para predictions
DROP TRIGGER IF EXISTS trigger_predictions_actualizado_en ON predictions;
CREATE TRIGGER trigger_predictions_actualizado_en
BEFORE UPDATE ON predictions
FOR EACH ROW
EXECUTE FUNCTION update_actualizado_en();

-- Trigger para prize_pool
DROP TRIGGER IF EXISTS trigger_prize_pool_actualizado_en ON prize_pool;
CREATE TRIGGER trigger_prize_pool_actualizado_en
BEFORE UPDATE ON prize_pool
FOR EACH ROW
EXECUTE FUNCTION update_actualizado_en();

-- Trigger para special_predictions
DROP TRIGGER IF EXISTS trigger_special_predictions_actualizado_en ON special_predictions;
CREATE TRIGGER trigger_special_predictions_actualizado_en
BEFORE UPDATE ON special_predictions
FOR EACH ROW
EXECUTE FUNCTION update_actualizado_en();

-- ============================================
-- PARTE 5: Crear índice si falta
-- ============================================
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- ============================================
-- VERIFICACIÓN
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migración 009 completada exitosamente';
  RAISE NOTICE '   - scoring_config: tabla creada/verificada';
  RAISE NOTICE '   - push_subscriptions.actualizado_en: columna agregada';
  RAISE NOTICE '   - special_predictions.actualizado_en: columna agregada';
  RAISE NOTICE '   - Triggers actualizado_en: configurados';
END $$;
