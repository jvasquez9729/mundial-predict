-- ============================================
-- Migración 006: Limpieza de push_subscriptions
-- ============================================
-- Unifica las definiciones de las migraciones 001 y 002
-- Estandariza a naming en español para consistencia

-- Paso 1: Renombrar columnas si existen con nombres en inglés
-- (Solo aplica si la tabla fue creada con 002 antes de 001)
DO $$
BEGIN
    -- Verificar si existe created_at (versión inglesa)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'push_subscriptions' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE push_subscriptions RENAME COLUMN created_at TO creado_en;
    END IF;

    -- Verificar si existe updated_at (versión inglesa)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'push_subscriptions' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE push_subscriptions RENAME COLUMN updated_at TO actualizado_en;
    END IF;

    -- Agregar actualizado_en si no existe (versión 001 no la tenía)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'push_subscriptions' AND column_name = 'actualizado_en'
    ) THEN
        ALTER TABLE push_subscriptions ADD COLUMN actualizado_en TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Paso 2: Crear o reemplazar el trigger para actualizado_en
CREATE OR REPLACE FUNCTION update_push_subscription_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger anterior si existe (de migración 002)
DROP TRIGGER IF EXISTS update_push_subscription_timestamp ON push_subscriptions;
DROP FUNCTION IF EXISTS update_push_subscription_timestamp();

-- Crear nuevo trigger con nombre consistente
DROP TRIGGER IF EXISTS trigger_push_subscription_actualizado_en ON push_subscriptions;
CREATE TRIGGER trigger_push_subscription_actualizado_en
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscription_actualizado_en();

-- Paso 3: Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- Paso 4: Documentar la tabla
COMMENT ON TABLE push_subscriptions IS 'Suscripciones de notificaciones push por usuario';
COMMENT ON COLUMN push_subscriptions.creado_en IS 'Fecha de creación del registro';
COMMENT ON COLUMN push_subscriptions.actualizado_en IS 'Última actualización del registro';
