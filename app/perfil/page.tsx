'use client'

import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Settings, Bell, Shield } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function PerfilPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
        }
      } catch {
        // Error loading user
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Debes iniciar sesión para ver tu perfil</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('nav.settings')}
          </h1>
          <p className="text-muted-foreground">
            Administra tu perfil y preferencias
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Información del Perfil */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Información Personal</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  defaultValue={user.nombre_completo || ''}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email || ''}
                  disabled
                />
              </div>
              <Button disabled>
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>

          {/* Configuración Rápida */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>Configuración</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Notificaciones</h3>
                <p className="text-xs text-muted-foreground">
                  Administra tus preferencias de notificaciones
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <Bell className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Seguridad</h3>
                <p className="text-xs text-muted-foreground">
                  Cambia tu contraseña y ajustes de seguridad
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <Shield className="h-4 w-4 mr-2" />
                  Seguridad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
