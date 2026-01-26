'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Link2, Trophy, Target, Loader2 } from 'lucide-react'

interface AdminStats {
  totalUsuarios: number
  linksDisponibles: number
  linksUsados: number
  totalPartidos: number
  partidosFinalizados: number
  pozoTotal: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch links stats
        const linksRes = await fetch('/api/admin/links')
        const linksData = await linksRes.json()

        // Fetch leaderboard for user count
        const leaderboardRes = await fetch('/api/leaderboard')
        const leaderboardData = await leaderboardRes.json()

        setStats({
          totalUsuarios: leaderboardData.total_participantes || 0,
          linksDisponibles: linksData.stats?.disponibles || 0,
          linksUsados: linksData.stats?.usados || 0,
          totalPartidos: 0, // TODO: Fetch from matches API
          partidosFinalizados: 0,
          pozoTotal: leaderboardData.pozo?.pozo_total || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats?.totalUsuarios || 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Links Disponibles',
      value: stats?.linksDisponibles || 0,
      icon: Link2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Links Usados',
      value: stats?.linksUsados || 0,
      icon: Target,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Pozo Total',
      value: `$${((stats?.pozoTotal || 0) / 1000).toFixed(0)}k`,
      icon: Trophy,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Gestiona el torneo Mundial Predict 2026
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/links"
              className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
            >
              <Link2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Generar Links de Registro</p>
                <p className="text-xs text-muted-foreground">
                  Crea nuevos links para invitar usuarios
                </p>
              </div>
            </a>
            <a
              href="/admin/usuarios"
              className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
            >
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Ver Usuarios</p>
                <p className="text-xs text-muted-foreground">
                  Lista completa de participantes
                </p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Distribución de Premios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">1er Lugar (55%)</span>
                <span className="font-bold text-foreground">
                  ${((stats?.pozoTotal || 0) * 0.55 / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Más Exactos (25%)</span>
                <span className="font-bold text-foreground">
                  ${((stats?.pozoTotal || 0) * 0.25 / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fase Grupos (10%)</span>
                <span className="font-bold text-foreground">
                  ${((stats?.pozoTotal || 0) * 0.10 / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                <span className="text-sm font-medium text-muted-foreground">Reserva (10%)</span>
                <span className="font-bold text-muted-foreground">
                  ${((stats?.pozoTotal || 0) * 0.10 / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
