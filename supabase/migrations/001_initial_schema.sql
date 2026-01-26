-- Mundial Predict - Schema Inicial
-- Ejecutar en Supabase SQL Editor

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo TEXT NOT NULL,
  cedula TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  celular TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  es_admin BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cedula ON users(cedula);
CREATE INDEX idx_users_celular ON users(celular);

-- ============================================
-- TABLA: registration_links
-- ============================================
CREATE TABLE registration_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  usado_por UUID REFERENCES users(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  expira_en TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_registration_links_token ON registration_links(token);

-- ============================================
-- TABLA: teams
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  bandera_url TEXT,
  grupo TEXT,
  external_id INTEGER UNIQUE
);

CREATE INDEX idx_teams_external ON teams(external_id);

-- ============================================
-- TABLA: matches
-- ============================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_local_id UUID REFERENCES teams(id) NOT NULL,
  equipo_visitante_id UUID REFERENCES teams(id) NOT NULL,
  fase TEXT NOT NULL CHECK (fase IN ('grupos', 'octavos', 'cuartos', 'semifinal', 'tercer_puesto', 'final')),
  fecha_hora TIMESTAMPTZ NOT NULL,
  estadio TEXT,
  goles_local INTEGER,
  goles_visitante INTEGER,
  estado TEXT DEFAULT 'proximo' CHECK (estado IN ('proximo', 'en_vivo', 'finalizado')),
  predicciones_cerradas BOOLEAN DEFAULT FALSE,
  external_id INTEGER UNIQUE
);

CREATE INDEX idx_matches_fecha ON matches(fecha_hora);
CREATE INDEX idx_matches_fase ON matches(fase);
CREATE INDEX idx_matches_estado ON matches(estado);
CREATE INDEX idx_matches_external ON matches(external_id);

-- ============================================
-- TABLA: predictions
-- ============================================
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  goles_local INTEGER NOT NULL CHECK (goles_local >= 0 AND goles_local <= 20),
  goles_visitante INTEGER NOT NULL CHECK (goles_visitante >= 0 AND goles_visitante <= 20),
  puntos_obtenidos INTEGER DEFAULT 0,
  es_exacto BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);

-- ============================================
-- TABLA: special_predictions
-- ============================================
CREATE TABLE special_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  campeon_id UUID REFERENCES teams(id),
  subcampeon_id UUID REFERENCES teams(id),
  goleador TEXT,
  colombia_hasta TEXT CHECK (colombia_hasta IN ('grupos', 'octavos', 'cuartos', 'semifinal', 'final', 'campeon')),
  bloqueado_principal BOOLEAN DEFAULT FALSE,
  bloqueado_colombia BOOLEAN DEFAULT FALSE,
  puntos_campeon INTEGER DEFAULT 0,
  puntos_subcampeon INTEGER DEFAULT 0,
  puntos_goleador INTEGER DEFAULT 0,
  puntos_colombia INTEGER DEFAULT 0,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: prize_pool (singleton)
-- ============================================
CREATE TABLE prize_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_usuarios INTEGER DEFAULT 0,
  pozo_total INTEGER DEFAULT 0,
  premio_primero INTEGER DEFAULT 0,
  premio_exactos INTEGER DEFAULT 0,
  premio_grupos INTEGER DEFAULT 0,
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar registro inicial del pozo
INSERT INTO prize_pool (total_usuarios, pozo_total, premio_primero, premio_exactos, premio_grupos)
VALUES (0, 0, 0, 0, 0);

-- ============================================
-- TABLA: leaderboard_history
-- ============================================
CREATE TABLE leaderboard_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  posicion INTEGER NOT NULL,
  puntos_totales INTEGER NOT NULL,
  marcadores_exactos INTEGER NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_history_user ON leaderboard_history(user_id);
CREATE INDEX idx_leaderboard_history_fecha ON leaderboard_history(fecha);

-- ============================================
-- TABLA: push_subscriptions
-- ============================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- ============================================
-- VISTA: leaderboard
-- ============================================
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.id as user_id,
  u.nombre_completo,
  COALESCE(SUM(p.puntos_obtenidos), 0) + COALESCE(sp.puntos_campeon, 0) + COALESCE(sp.puntos_subcampeon, 0) + COALESCE(sp.puntos_goleador, 0) + COALESCE(sp.puntos_colombia, 0) as puntos_totales,
  COALESCE(SUM(CASE WHEN p.es_exacto THEN 1 ELSE 0 END), 0) as marcadores_exactos,
  COALESCE(SUM(CASE WHEN p.puntos_obtenidos > 0 THEN 1 ELSE 0 END), 0) as predicciones_correctas,
  COUNT(p.id) as total_predicciones
FROM users u
LEFT JOIN predictions p ON u.id = p.user_id
LEFT JOIN special_predictions sp ON u.id = sp.user_id
WHERE u.es_admin = FALSE
GROUP BY u.id, u.nombre_completo, sp.puntos_campeon, sp.puntos_subcampeon, sp.puntos_goleador, sp.puntos_colombia
ORDER BY puntos_totales DESC, marcadores_exactos DESC;

-- ============================================
-- FUNCIÓN: update_prize_pool
-- ============================================
CREATE OR REPLACE FUNCTION update_prize_pool()
RETURNS TRIGGER AS $$
DECLARE
  inscripcion INTEGER := 100000;
  nuevo_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO nuevo_total FROM users WHERE es_admin = FALSE;

  UPDATE prize_pool SET
    total_usuarios = nuevo_total,
    pozo_total = nuevo_total * inscripcion,
    premio_primero = FLOOR((nuevo_total * inscripcion) * 0.55),
    premio_exactos = FLOOR((nuevo_total * inscripcion) * 0.25),
    premio_grupos = FLOOR((nuevo_total * inscripcion) * 0.10),
    actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar pozo con cada registro
CREATE TRIGGER on_user_registered
AFTER INSERT ON users
FOR EACH ROW
WHEN (NEW.es_admin = FALSE)
EXECUTE FUNCTION update_prize_pool();

-- ============================================
-- FUNCIÓN: calculate_prediction_points
-- ============================================
CREATE OR REPLACE FUNCTION calculate_prediction_points(
  pred_local INTEGER,
  pred_visitante INTEGER,
  real_local INTEGER,
  real_visitante INTEGER
) RETURNS TABLE(puntos INTEGER, es_exacto BOOLEAN) AS $$
BEGIN
  -- Marcador exacto: 3 puntos
  IF pred_local = real_local AND pred_visitante = real_visitante THEN
    RETURN QUERY SELECT 3, TRUE;
  -- Acertó ganador o empate: 1 punto
  ELSIF (pred_local > pred_visitante AND real_local > real_visitante) OR
        (pred_local < pred_visitante AND real_local < real_visitante) OR
        (pred_local = pred_visitante AND real_local = real_visitante) THEN
    RETURN QUERY SELECT 1, FALSE;
  -- No acertó: 0 puntos
  ELSE
    RETURN QUERY SELECT 0, FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: update_predictions_for_match
-- ============================================
CREATE OR REPLACE FUNCTION update_predictions_for_match(match_uuid UUID)
RETURNS void AS $$
DECLARE
  m RECORD;
  p RECORD;
  result RECORD;
BEGIN
  -- Obtener datos del partido
  SELECT goles_local, goles_visitante INTO m FROM matches WHERE id = match_uuid;

  -- Si el partido no tiene resultado, salir
  IF m.goles_local IS NULL OR m.goles_visitante IS NULL THEN
    RETURN;
  END IF;

  -- Actualizar cada predicción
  FOR p IN SELECT id, goles_local, goles_visitante FROM predictions WHERE match_id = match_uuid
  LOOP
    SELECT * INTO result FROM calculate_prediction_points(
      p.goles_local, p.goles_visitante,
      m.goles_local, m.goles_visitante
    );

    UPDATE predictions SET
      puntos_obtenidos = result.puntos,
      es_exacto = result.es_exacto,
      actualizado_en = NOW()
    WHERE id = p.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS (Row Level Security) - Opcional
-- ============================================
-- Habilitar RLS en tablas sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_predictions ENABLE ROW LEVEL SECURITY;

-- Política: los usuarios solo pueden ver su propia información
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Política: predicciones visibles para todos, editables solo por propietario
CREATE POLICY "Predictions viewable by all" ON predictions
  FOR SELECT USING (true);

CREATE POLICY "Predictions editable by owner" ON predictions
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ============================================
-- DATOS INICIALES: Equipos del Mundial 2026
-- ============================================
-- Nota: Estos son los equipos que se espera participen.
-- Los IDs externos se actualizarán cuando se sincronice con SportMonks.

INSERT INTO teams (nombre, codigo, grupo) VALUES
-- Grupo A
('México', 'MEX', 'A'),
('Canadá', 'CAN', 'A'),
('Por definir A3', 'TBD1', 'A'),
('Por definir A4', 'TBD2', 'A'),
-- Grupo B
('Estados Unidos', 'USA', 'B'),
('Por definir B2', 'TBD3', 'B'),
('Por definir B3', 'TBD4', 'B'),
('Por definir B4', 'TBD5', 'B'),
-- Principales selecciones conocidas (sin grupo asignado aún)
('Argentina', 'ARG', NULL),
('Brasil', 'BRA', NULL),
('Francia', 'FRA', NULL),
('Inglaterra', 'ENG', NULL),
('España', 'ESP', NULL),
('Alemania', 'GER', NULL),
('Portugal', 'POR', NULL),
('Países Bajos', 'NED', NULL),
('Colombia', 'COL', NULL),
('Uruguay', 'URU', NULL),
('Bélgica', 'BEL', NULL),
('Italia', 'ITA', NULL);

-- ============================================
-- COMENTARIOS FINALES
-- ============================================
-- 1. Ejecutar este script en: Supabase Dashboard → SQL Editor
-- 2. Los equipos se actualizarán automáticamente al sincronizar con SportMonks
-- 3. Los partidos se cargarán desde la API cuando el torneo esté disponible
