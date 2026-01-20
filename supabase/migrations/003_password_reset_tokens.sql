-- Mundial Predict - Tabla para tokens de recuperación de contraseña
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- TABLA: password_reset_tokens
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  expira_en TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expira_en ON password_reset_tokens(expira_en);

-- Limpiar tokens expirados automáticamente (opcional - puede ejecutarse manualmente o con cron)
CREATE OR REPLACE FUNCTION clean_expired_password_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expira_en < NOW() OR usado = TRUE;
END;
$$ LANGUAGE plpgsql;
