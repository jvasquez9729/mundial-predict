'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/progress-ring'
import { StatsChart } from '@/components/stats-chart'
import { MatchCard } from '@/components/match-card'
import {
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  Loader2,
  Star,
  Clock,
  LogOut,
  Home,
  Award,
  Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/hooks/use-translation'
import { LanguageSwitcher } from '@/components/language-switcher'

interface UserStats {
  posicion: number
  puntos_totales: number
  marcadores_exactos: number
  predicciones_correctas: number
  total_predicciones: number
}

interface UpcomingMatch {
  id: string
  fecha_hora: string
  estadio: string
  fase: string
  predicciones_cerradas: boolean
  equipo_local: {
    nombre: string
    codigo: string
    bandera_url?: string
  }
  equipo_visitante: {
    nombre: string
    codigo: string
    bandera_url?: string
  }
  mi_prediccion: {
    goles_local: number
    goles_visitante: number
  } | null
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [matches, setMatches] = useState<UpcomingMatch[]>([])
  const [totalParticipantes, setTotalParticipantes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch('/api/auth/me')
        const userData = await userRes.json()
        if (userData.user) {
          setUserName(userData.user.nombre_completo)
        }

        const leaderboardRes = await fetch('/api/leaderboard')
        const leaderboardData = await leaderboardRes.json()

        if (leaderboardData.success) {
          setStats(leaderboardData.mi_datos)
          setTotalParticipantes(leaderboardData.total_participantes)
        }

        const matchesRes = await fetch('/api/matches?upcoming=true&limit=5')
        const matchesData = await matchesRes.json()

        if (matchesData.success) {
          setMatches(matchesData.matches)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching dashboard data:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const accuracy = stats && stats.total_predicciones > 0
    ? Math.round((stats.predicciones_correctas / stats.total_predicciones) * 100)
    : 0

  const positionPercent = totalParticipantes > 0 && stats?.posicion
    ? Math.round(((totalParticipantes - stats.posicion + 1) / totalParticipantes) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary transition-transform hover:scale-105">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Mundial Predict</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/">
              <Button variant="ghost" size="sm" className="transition-colors">
                <Home className="h-4 w-4 mr-2" />
                {t('nav.home')}
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="transition-colors"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/';
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {/* Welcome */}
        <motion.div 
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('dashboard.welcome', { name: userName.split(' ')[0] })}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.welcomeBack')}
          </p>
        </motion.div>

        {/* Stats Cards with Animations */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-border bg-card transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                      {t('dashboard.yourPosition')}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-foreground">
                        #{stats?.posicion || '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.of')} {totalParticipantes}
                      </p>
                    </div>
                    {stats?.posicion && (
                      <div className="mt-3">
                        <ProgressRing 
                          progress={positionPercent} 
                          size={60} 
                          strokeWidth={6}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-border bg-card transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                      {t('dashboard.points')}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats?.puntos_totales?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('dashboard.accumulated')}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 transition-colors">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-border bg-card transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                      {t('dashboard.exact')}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats?.marcadores_exactos || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('dashboard.markers')}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 transition-colors">
                    <Star className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="border-border bg-card transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                      {t('dashboard.predictions')}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats?.total_predicciones || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('dashboard.made')}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Stats Chart */}
        {stats && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mb-8"
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Estadísticas Visuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart stats={stats} maxPoints={100} />
                <div className="mt-4 flex items-center justify-center">
                  <ProgressRing 
                    progress={accuracy} 
                    size={120} 
                    strokeWidth={10}
                    label="Precisión"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming Matches */}
          <motion.div
            className="lg:col-span-2"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('dashboard.upcomingMatches')}
                </CardTitle>
                <Link href="/predicciones">
                  <Button variant="ghost" size="sm" className="transition-colors">
                    {t('dashboard.seeAll')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t('dashboard.noUpcomingMatches')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {matches.map((match, index) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      >
                        <MatchCard match={match} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/predicciones" className="block">
                  <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-all hover:bg-secondary hover:shadow-md hover:scale-[1.02] cursor-pointer">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{t('dashboard.makePredictions')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('dashboard.makePredictionsDesc')}
                      </p>
                    </div>
                  </div>
                </Link>
                <Link href="/" className="block">
                  <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-all hover:bg-secondary hover:shadow-md hover:scale-[1.02] cursor-pointer">
                    <Trophy className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{t('dashboard.viewLeaderboard')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('dashboard.viewLeaderboardDesc')}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20 transition-all hover:bg-primary/15">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {t('dashboard.dailyTip')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.dailyTipText')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
