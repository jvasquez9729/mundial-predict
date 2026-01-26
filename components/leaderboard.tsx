'use client'

import { useEffect, useState, useCallback } from 'react'
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Loader2, Award, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/progress-ring'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/hooks/use-translation'

interface LeaderboardEntry {
  user_id: string
  nombre_completo: string
  puntos_totales: number
  marcadores_exactos: number
  predicciones_correctas: number
  total_predicciones: number
  posicion: number
}

interface LeaderboardResponse {
  success: boolean
  leaderboard: LeaderboardEntry[]
  mi_posicion: number
  mi_datos: LeaderboardEntry | null
  total_participantes: number
  error?: string
  pozo?: {
    pozo_total: number
    premio_primero: number
    premio_exactos: number
    premio_grupos: number
  }
}

function RankChange({ current, previous }: { current: number; previous?: number }) {
  if (!previous) return null
  
  const diff = previous - current

  if (diff > 0) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1 text-success"
      >
        <TrendingUp className="h-3 w-3" />
        <span className="text-xs font-medium">+{diff}</span>
      </motion.div>
    )
  }
  if (diff < 0) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1 text-destructive"
      >
        <TrendingDown className="h-3 w-3" />
        <span className="text-xs font-medium">{diff}</span>
      </motion.div>
    )
  }
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Minus className="h-3 w-3" />
    </div>
  )
}

function RankBadge({ rank, isUser }: { rank: number; isUser?: boolean }) {
  if (rank === 1) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-lg',
          isUser && 'ring-2 ring-yellow-400 ring-offset-2'
        )}
      >
        <Crown className="h-5 w-5" />
      </motion.div>
    )
  }
  if (rank === 2) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 shadow-md',
          isUser && 'ring-2 ring-gray-400 ring-offset-2'
        )}
      >
        <Medal className="h-5 w-5" />
      </motion.div>
    )
  }
  if (rank === 3) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-md',
          isUser && 'ring-2 ring-amber-500 ring-offset-2'
        )}
      >
        <Medal className="h-5 w-5" />
      </motion.div>
    )
  }
  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold transition-all',
        isUser && 'ring-2 ring-primary ring-offset-2 bg-primary/10'
      )}
    >
      <span className="text-sm">{rank}</span>
    </div>
  )
}

export function Leaderboard() {
  const { t } = useTranslation()
  const [players, setPlayers] = useState<LeaderboardEntry[]>([])
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null)
  const [totalParticipantes, setTotalParticipantes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [showAll, setShowAll] = useState(false)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/leaderboard?limit=10')
      const data: LeaderboardResponse = await response.json()

      if (data.success) {
        setPlayers(data.leaderboard || [])
        setUserEntry(data.mi_datos || null)
        setTotalParticipantes(data.total_participantes || 0)
        setError(null)
      } else {
        setError(data.error || 'Error al cargar clasificación')
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError('Error de conexión. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
      setLastUpdate(new Date())
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [fetchLeaderboard])

  const topThree = players.slice(0, 3)
  const rest = players.slice(3)
  const showUserSeparately = userEntry && !players.some(p => p.user_id === userEntry.user_id)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-card-foreground">
                {t('leaderboard.title')}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {t('leaderboard.updated', { time: lastUpdate.toLocaleTimeString('es-ES') })}
              </p>
            </div>
          </div>
          <div className="flex h-2 w-2 animate-pulse rounded-full bg-success" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="ghost" size="sm" onClick={fetchLeaderboard} className="mt-2">
              {t('common.retry')}
            </Button>
          </div>
        ) : (!players || players.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm font-medium text-foreground mb-1">{t('leaderboard.noParticipants')}</p>
            <p className="text-xs text-muted-foreground">
              Sé el primero en unirte y comienza a competir por el primer lugar
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {topThree.map((player, index) => {
                  const initials = player.nombre_completo
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()

                  return (
                    <motion.div
                      key={player.user_id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'relative rounded-xl border-2 p-4 text-center transition-all',
                        index === 0
                          ? 'border-yellow-400 bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 order-2'
                          : index === 1
                          ? 'border-gray-400 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 order-1'
                          : 'border-amber-600 bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 order-3'
                      )}
                    >
                      {index === 0 && (
                        <Crown className="absolute -top-2 left-1/2 -translate-x-1/2 h-5 w-5 text-yellow-600" />
                      )}
                      <RankBadge rank={player.posicion} />
                      <Avatar className="mx-auto my-2 h-12 w-12 border-2">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-lg font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-bold text-foreground truncate w-full">
                        {player.nombre_completo.split(' ')[0]}
                      </p>
                      <p className="text-lg font-bold text-primary mt-1">
                        {player.puntos_totales.toLocaleString()}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Rest of Top 10 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {t('leaderboard.topTen')}
                </h3>
                {rest.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs"
                  >
                    {showAll ? 'Ver menos' : 'Ver más'}
                  </Button>
                )}
              </div>
              <AnimatePresence>
                {(showAll ? rest : rest.slice(0, 3)).map((player, index) => {
                  const accuracy =
                    player.total_predicciones > 0
                      ? Math.round((player.predicciones_correctas / player.total_predicciones) * 100)
                      : 0
                  const initials = player.nombre_completo
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()

                  return (
                    <motion.div
                      key={player.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border border-border p-3 transition-all hover:bg-muted/20 hover:shadow-sm',
                        player.posicion <= 3 && 'bg-muted/10'
                      )}
                    >
                      <RankBadge rank={player.posicion} />
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {player.nombre_completo}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted max-w-[100px]">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{accuracy}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-primary">
                          {player.puntos_totales.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {player.marcadores_exactos} {t('leaderboard.exact')}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* User Position (if not in top 10) */}
            {showUserSeparately && userEntry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-xl border-2 border-primary bg-primary/5 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    {t('leaderboard.yourPosition')}
                  </h3>
                  <ProgressRing
                    progress={totalParticipantes > 0 ? Math.round(((totalParticipantes - userEntry.posicion + 1) / totalParticipantes) * 100) : 0}
                    size={50}
                    strokeWidth={6}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <RankBadge rank={userEntry.posicion} isUser />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Tú</p>
                    <p className="text-xs text-muted-foreground">
                      Posición {userEntry.posicion} de {totalParticipantes}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-primary">
                      {userEntry.puntos_totales.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userEntry.marcadores_exactos} exactas
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
