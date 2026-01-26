-- Seed some World Cup 2026 matches
INSERT INTO matches (home_team, home_team_code, away_team, away_team_code, match_date, stage, group_name, stadium, city, status) VALUES
-- Group Stage - Upcoming
('Argentina', 'AR', 'Brasil', 'BR', '2026-06-15 18:00:00+00', 'Fase de Grupos', 'Grupo A', 'MetLife Stadium', 'Nueva York', 'upcoming'),
('España', 'ES', 'Alemania', 'DE', '2026-06-15 21:00:00+00', 'Fase de Grupos', 'Grupo B', 'SoFi Stadium', 'Los Angeles', 'upcoming'),
('Francia', 'FR', 'Inglaterra', 'GB', '2026-06-16 18:00:00+00', 'Fase de Grupos', 'Grupo C', 'AT&T Stadium', 'Dallas', 'upcoming'),
('México', 'MX', 'Estados Unidos', 'US', '2026-06-16 21:00:00+00', 'Fase de Grupos', 'Grupo D', 'Estadio Azteca', 'Ciudad de México', 'upcoming'),
('Portugal', 'PT', 'Paises Bajos', 'NL', '2026-06-17 18:00:00+00', 'Fase de Grupos', 'Grupo E', 'BMO Stadium', 'Toronto', 'upcoming'),
('Colombia', 'CO', 'Italia', 'IT', '2026-06-17 21:00:00+00', 'Fase de Grupos', 'Grupo F', 'Hard Rock Stadium', 'Miami', 'upcoming'),
('Japón', 'JP', 'Corea del Sur', 'KR', '2026-06-18 15:00:00+00', 'Fase de Grupos', 'Grupo G', 'BC Place', 'Vancouver', 'upcoming'),
('Canadá', 'CA', 'Marruecos', 'MA', '2026-06-18 18:00:00+00', 'Fase de Grupos', 'Grupo H', 'BMO Field', 'Toronto', 'upcoming')
ON CONFLICT DO NOTHING;
