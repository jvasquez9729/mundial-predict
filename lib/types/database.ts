// Tipos para la base de datos de Mundial Predict

export interface User {
  id: string
  nombre_completo: string
  cedula: string
  email: string
  celular: string
  password_hash: string
  es_admin: boolean
  creado_en: string
}

export type UserPublic = Omit<User, 'password_hash'>

export interface RegistrationLink {
  id: string
  token: string
  usado: boolean
  usado_por: string | null
  creado_en: string
  expira_en: string
}

export interface Team {
  id: string
  nombre: string
  codigo: string
  bandera_url: string
  grupo: string | null
  external_id: number | null
}

export type MatchPhase = 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'tercer_puesto' | 'final'
export type MatchStatus = 'proximo' | 'en_vivo' | 'finalizado'

export interface Match {
  id: string
  equipo_local_id: string
  equipo_visitante_id: string
  fase: MatchPhase
  fecha_hora: string
  estadio: string
  goles_local: number | null
  goles_visitante: number | null
  estado: MatchStatus
  predicciones_cerradas: boolean
  external_id: number | null
}

export interface MatchWithTeams extends Match {
  equipo_local: Team
  equipo_visitante: Team
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  goles_local: number
  goles_visitante: number
  puntos_obtenidos: number
  es_exacto: boolean
  creado_en: string
  actualizado_en: string
}

export interface PredictionWithMatch extends Prediction {
  match: MatchWithTeams
}

export type ColombiaProgress = 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'final' | 'campeon'

export interface SpecialPrediction {
  id: string
  user_id: string
  campeon_id: string | null
  subcampeon_id: string | null
  goleador: string | null
  colombia_hasta: ColombiaProgress | null
  bloqueado_principal: boolean
  bloqueado_colombia: boolean
  creado_en: string
  puntos_campeon: number
  puntos_subcampeon: number
  puntos_goleador: number
  puntos_colombia: number
}

export interface PrizePool {
  id: string
  total_usuarios: number
  pozo_total: number
  premio_primero: number
  premio_exactos: number
  premio_grupos: number
  actualizado_en: string
}

export interface LeaderboardEntry {
  user_id: string
  nombre_completo: string
  puntos_totales: number
  marcadores_exactos: number
  predicciones_correctas: number
  total_predicciones: number
  posicion: number
  posicion_anterior: number | null
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Tipos para SportMonks API
export interface SportMonksMatch {
  id: number
  sport_id: number
  league_id: number
  season_id: number
  stage_id: number
  group_id: number | null
  round_id: number
  state_id: number
  venue_id: number
  name: string
  starting_at: string
  result_info: string | null
  leg: string
  details: string | null
  length: number
  placeholder: boolean
  has_odds: boolean
  participants?: SportMonksParticipant[]
  scores?: SportMonksScore[]
}

export interface SportMonksParticipant {
  id: number
  sport_id: number
  country_id: number
  venue_id: number
  gender: string
  name: string
  short_code: string
  image_path: string
  meta: {
    location: 'home' | 'away'
    winner: boolean | null
    position: number
  }
}

export interface SportMonksScore {
  id: number
  fixture_id: number
  type_id: number
  participant_id: number
  score: {
    goals: number
    participant: 'home' | 'away'
  }
  description: string
}
