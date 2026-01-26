'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Link2,
  Plus,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  User,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getCsrfHeaders } from '@/lib/api/client'

interface RegistrationLink {
  id: string
  token: string
  url: string
  usado: boolean
  creado_en: string
  expira_en: string
  expirado: boolean
  usuario: {
    nombre_completo: string
    email: string
  } | null
}

interface LinkStats {
  total: number
  usados: number
  disponibles: number
  expirados: number
}

export default function AdminLinksPage() {
  const [links, setLinks] = useState<RegistrationLink[]>([])
  const [stats, setStats] = useState<LinkStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [cantidad, setCantidad] = useState(5)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function fetchLinks() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/links', { credentials: 'include' })
      const data = await res.json()

      if (data.success) {
        setLinks(data.links)
        setStats(data.stats)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Error al cargar links')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/links/generate', {
        method: 'POST',
        headers: getCsrfHeaders(),
        credentials: 'include',
        body: JSON.stringify({ cantidad }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(data.message)
        fetchLinks()
      } else {
        setError(data.error)
      }
    } catch {
      setError('Error al generar links')
    } finally {
      setGenerating(false)
    }
  }

  async function copyToClipboard(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError('Error al copiar')
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Links de Registro</h1>
          <p className="text-muted-foreground">
            Genera y gestiona links de invitación
          </p>
        </div>
        <Button onClick={() => fetchLinks()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-success/50 bg-success/10">
          <Check className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{stats.disponibles}</p>
              <p className="text-xs text-muted-foreground">Disponibles</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.usados}</p>
              <p className="text-xs text-muted-foreground">Usados</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.expirados}</p>
              <p className="text-xs text-muted-foreground">Expirados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Form */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generar Nuevos Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Cantidad de links
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                className="bg-input border-border"
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-primary text-primary-foreground"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generar Links
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Los links expiran en 48 horas después de ser generados
          </p>
        </CardContent>
      </Card>

      {/* Links List */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Links Generados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : links.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay links generados
            </p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {link.usado ? (
                        <Badge className="bg-primary/20 text-primary">
                          <User className="h-3 w-3 mr-1" />
                          Usado
                        </Badge>
                      ) : link.expirado ? (
                        <Badge variant="destructive">
                          <Clock className="h-3 w-3 mr-1" />
                          Expirado
                        </Badge>
                      ) : (
                        <Badge className="bg-success/20 text-success">
                          Disponible
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(link.creado_en)}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-foreground truncate mt-1">
                      {link.url}
                    </p>
                    {link.usuario && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Usado por: {link.usuario.nombre_completo}
                      </p>
                    )}
                  </div>
                  {!link.usado && !link.expirado && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(link.url, link.id)}
                      className="shrink-0"
                    >
                      {copiedId === link.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-success" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
