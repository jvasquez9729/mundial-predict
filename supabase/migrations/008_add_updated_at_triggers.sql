-- ============================================
-- Migración 008: Agregar triggers para actualizado_en
-- ============================================
-- Agrega triggers automáticos para actualizar el campo
-- actualizado_en cuando se modifica un registro.

-- ============================================
-- Función genérica para actualizar timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger para predictions
-- ============================================
-- Nota: update_predictions_for_match() ya actualiza manualmente,
-- pero este trigger asegura que cualquier UPDATE actualice el timestamp
DROP TRIGGER IF EXISTS trigger_predictions_actualizado_en ON predictions;
CREATE TRIGGER trigger_predictions_actualizado_en
BEFORE UPDATE ON predictions
FOR EACH ROW
EXECUTE FUNCTION update_actualizado_en();

-- ============================================
-- Trigger para prize_pool
-- ============================================
-- Nota: update_prize_pool() ya actualiza manualmente,
-- pero este trigger asegura consistencia
DROP TRIGGER IF EXISTS trigger_prize_pool_actualizado_en ON prize_pool;
CREATE TRIGGER trigger_prize_pool_actualizado_en
BEFORE UPDATE ON prize_pool
FOR EACH ROW
EXECUTE FUNCTION update_actualizado_en();

-- ============================================
-- Trigger para special_predictions (si no existe)
-- ============================================
-- Verificar si la tabla tiene actualizado_en y agregar trigger
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'special_predictions' AND column_name = 'actualizado_en'
    ) THEN
        DROP TRIGGER IF EXISTS trigger_special_predictions_actualizado_en ON special_predictions;
        CREATE TRIGGER trigger_special_predictions_actualizado_en
        BEFORE UPDATE ON special_predictions
        FOR EACH ROW
        EXECUTE FUNCTION update_actualizado_en();
    ELSE
        -- Agregar columna si no existe
        ALTER TABLE special_predictions ADD COLUMN actualizado_en TIMESTAMPTZ DEFAULT NOW();
        CREATE TRIGGER trigger_special_predictions_actualizado_en
        BEFORE UPDATE ON special_predictions
        FOR EACH ROW
        EXECUTE FUNCTION update_actualizado_en();
    END IF;
END $$;

-- ============================================
-- Documentar los triggers
-- ============================================
COMMENT ON FUNCTION update_actualizado_en() IS
  'Función genérica para actualizar automáticamente el campo actualizado_en';
