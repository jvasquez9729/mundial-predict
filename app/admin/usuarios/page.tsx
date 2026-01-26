'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Users,
  Search,
  Loader2,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Trophy,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  ClipboardList,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { getCsrfHeaders } from '@/lib/api/client'

interface User {
  id: string
  nombre_completo: string
  email: string
  cedula: string
  celular: string
  es_admin: boolean
  creado_en: string
}

interface UserWithStats extends User {
  puntos_totales?: number
  marcadores_exactos?: number
  predicciones_correctas?: number
  total_predicciones?: number
  posicion?: number
}

interface EditUserForm extends Partial<User> {
  password?: string
}

type MatchInfo = { id: string; fase: string; fecha_hora: string; estadio: string | null; estado: string; equipo_local: { nombre: string; codigo: string } | null; equipo_visitante: { nombre: string; codigo: string } | null }
type PredictionItem = { id: string; match_id: string; goles_local: number; goles_visitante: number; puntos_obtenidos: number; es_exacto: boolean; creado_en: string; match: MatchInfo | null }

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<EditUserForm>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [viewingPredictionsUser, setViewingPredictionsUser] = useState<UserWithStats | null>(null)
  const [predictionsData, setPredictionsData] = useState<{ predictions: PredictionItem[]; matchesWithoutPrediction: MatchInfo[] } | null>(null)
  const [loadingPredictions, setLoadingPredictions] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsuarios()
  }, [])

  useEffect(() => {
    if (!viewingPredictionsUser) {
      setPredictionsData(null)
      return
    }
    let cancelled = false
    setLoadingPredictions(true)
    setPredictionsData(null)
    fetch(`/api/admin/reports/predictions?user_id=${encodeURIComponent(viewingPredictionsUser.id)}&format=json`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.success) return
        setPredictionsData({
          predictions: data.predictions || [],
          matchesWithoutPrediction: data.matchesWithoutPrediction || [],
        })
      })
      .catch(() => {
        if (!cancelled) {
          toast({ title: 'Error', description: 'Error al cargar predicciones', variant: 'destructive' })
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPredictions(false)
      })
    return () => { cancelled = true }
  }, [viewingPredictionsUser, toast])

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users', { credentials: 'include' })
      const data = await res.json()

      if (data.success) {
        setUsuarios(data.users || [])
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Error al cargar usuarios',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error)
      toast({
        title: 'Error',
        description: 'Error de conexión al cargar usuarios',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({
      nombre_completo: user.nombre_completo,
      email: user.email,
      cedula: user.cedula,
      celular: user.celular,
      es_admin: user.es_admin,
    })
  }

  const handleSave = async () => {
    if (!editingUser) return

    try {
      setSaving(true)
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: getCsrfHeaders(),
        body: JSON.stringify(editForm),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && (data as { success?: boolean }).success) {
        toast({
          title: 'Éxito',
          description: 'Usuario actualizado exitosamente',
        })
        setEditingUser(null)
        setEditForm({})
        await fetchUsuarios()
      } else {
        const err = (data as { error?: string }).error || `Error ${res.status}`
        if (!res.ok) {
          console.error('[Admin] PUT /api/admin/users/[id] error:', res.status, data)
        }
        if (res.status === 401) {
          toast({ title: 'Error', description: 'Sesión expirada. Inicia sesión de nuevo.', variant: 'destructive' })
        } else if (res.status === 403) {
          toast({ title: 'Error', description: 'No tienes permiso para editar usuarios.', variant: 'destructive' })
        } else {
          toast({ title: 'Error', description: err || 'Error al actualizar usuario', variant: 'destructive' })
        }
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error de conexión al actualizar usuario',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      setDeleting(userId)
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getCsrfHeaders(),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && (data as { success?: boolean }).success) {
        toast({
          title: 'Éxito',
          description: 'Usuario eliminado exitosamente',
        })
        await fetchUsuarios()
      } else {
        const err = (data as { error?: string }).error || `Error ${res.status}`
        if (!res.ok) {
          console.error('[Admin] DELETE /api/admin/users/[id] error:', res.status, data)
        }
        if (res.status === 401) {
          toast({ title: 'Error', description: 'Sesión expirada. Inicia sesión de nuevo.', variant: 'destructive' })
        } else if (res.status === 403) {
          toast({ title: 'Error', description: 'No tienes permiso para eliminar usuarios.', variant: 'destructive' })
        } else {
          toast({ title: 'Error', description: err || 'Error al eliminar usuario', variant: 'destructive' })
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error de conexión al eliminar usuario',
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
    }
  }

  const filteredUsuarios = useMemo(
    () =>
      usuarios.filter(
        (u) =>
          u.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.cedula ?? '').includes(search) ||
          (u.celular ?? '').includes(search)
      ),
    [usuarios, search]
  )

  const statsSummary = useMemo(
    () => ({
      total: usuarios.length,
      admins: usuarios.filter((u) => u.es_admin).length,
      participants: usuarios.filter((u) => !u.es_admin).length,
      conPuntos: usuarios.filter((u) => (u.puntos_totales ?? 0) > 0).length,
    }),
    [usuarios]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administración de Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona los usuarios del sistema: edita información y elimina usuarios
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, cédula o celular..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-input border-border"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{statsSummary.total}</p>
            <p className="text-xs text-muted-foreground">Total Usuarios</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{statsSummary.admins}</p>
            <p className="text-xs text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{statsSummary.participants}</p>
            <p className="text-xs text-muted-foreground">Participantes</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{statsSummary.conPuntos}</p>
            <p className="text-xs text-muted-foreground">Con Puntos</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios ({filteredUsuarios.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {search ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                      Contacto
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground md:table-cell">
                      Fecha Registro
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-muted-foreground">
                      Puntos
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-muted-foreground">
                      Pos.
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-muted-foreground">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsuarios.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                              {usuario.nombre_completo
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {usuario.nombre_completo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {usuario.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CreditCard className="h-3 w-3" />
                            {usuario.cedula}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {usuario.celular}
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(usuario.creado_en).toLocaleDateString('es-CO')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-foreground">
                          {(usuario.puntos_totales ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {usuario.posicion != null ? `#${usuario.posicion}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {usuario.es_admin ? (
                          <Badge className="bg-destructive/10 text-destructive">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            Usuario
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingPredictionsUser(usuario)}
                            className="h-8 w-8 p-0"
                            title="Ver predicciones"
                            aria-label="Ver predicciones"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(usuario)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Editar Usuario</DialogTitle>
                                <DialogDescription>
                                  Modifica la información del usuario. Deja los campos vacíos si no deseas cambiarlos.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-nombre">Nombre Completo</Label>
                                  <Input
                                    id="edit-nombre"
                                    value={editForm.nombre_completo || ''}
                                    onChange={(e) => setEditForm({ ...editForm, nombre_completo: e.target.value })}
                                    placeholder={usuario.nombre_completo}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-email">Correo Electrónico</Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.email || ''}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    placeholder={usuario.email}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-cedula">Cédula</Label>
                                  <Input
                                    id="edit-cedula"
                                    value={editForm.cedula || ''}
                                    onChange={(e) => setEditForm({ ...editForm, cedula: e.target.value.replace(/\D/g, '') })}
                                    placeholder={usuario.cedula}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-celular">Celular</Label>
                                  <Input
                                    id="edit-celular"
                                    type="tel"
                                    value={editForm.celular || ''}
                                    onChange={(e) => setEditForm({ ...editForm, celular: e.target.value.replace(/\D/g, '') })}
                                    placeholder={usuario.celular}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
                                  <Input
                                    id="edit-password"
                                    type="password"
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                    placeholder="Deja vacío para no cambiar"
                                    minLength={6}
                                  />
                                </div>
                                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <Label htmlFor="edit-admin">Administrador</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Otorgar permisos de administrador
                                    </p>
                                  </div>
                                  <Switch
                                    id="edit-admin"
                                    checked={editForm.es_admin || false}
                                    onCheckedChange={(checked) => setEditForm({ ...editForm, es_admin: checked })}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditingUser(null)
                                    setEditForm({})
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button onClick={handleSave} disabled={saving}>
                                  {saving ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Guardando...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="mr-2 h-4 w-4" />
                                      Guardar
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará el usuario{' '}
                                  <strong>{usuario.nombre_completo}</strong> y todas sus predicciones asociadas.
                                  {usuario.es_admin && (
                                    <span className="block mt-2 text-destructive font-medium">
                                      ⚠️ Advertencia: Este usuario es administrador.
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(usuario.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={deleting === usuario.id}
                                >
                                  {deleting === usuario.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Eliminando...
                                    </>
                                  ) : (
                                    'Eliminar'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewingPredictionsUser} onOpenChange={(open) => !open && setViewingPredictionsUser(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Predicciones — {viewingPredictionsUser?.nombre_completo ?? ''}
            </DialogTitle>
            <DialogDescription>
              Solo lectura. Predicciones realizadas y partidos sin predicción.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {loadingPredictions ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : predictionsData ? (
              <>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Predicciones realizadas ({predictionsData.predictions.length})
                  </h4>
                  {predictionsData.predictions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ninguna.</p>
                  ) : (
                    <ul className="space-y-2 border border-border rounded-lg divide-y divide-border">
                      {predictionsData.predictions.map((p) => {
                        const m = p.match
                        const local = m?.equipo_local?.nombre ?? '—'
                        const visitante = m?.equipo_visitante?.nombre ?? '—'
                        return (
                          <li key={p.id} className="px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span className="font-medium">
                              {local} vs {visitante}
                            </span>
                            <span className="text-muted-foreground">
                              Pred: {p.goles_local}–{p.goles_visitante}
                              {p.puntos_obtenidos != null && p.puntos_obtenidos > 0 && (
                                <span className="ml-2 text-success"> · {p.puntos_obtenidos} pts</span>
                              )}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Partidos sin predicción ({predictionsData.matchesWithoutPrediction.length})
                  </h4>
                  {predictionsData.matchesWithoutPrediction.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ninguno.</p>
                  ) : (
                    <ul className="space-y-2 border border-border rounded-lg divide-y divide-border">
                      {predictionsData.matchesWithoutPrediction.map((m) => {
                        const local = m.equipo_local?.nombre ?? '—'
                        const visitante = m.equipo_visitante?.nombre ?? '—'
                        const fecha = m.fecha_hora ? new Date(m.fecha_hora).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—'
                        return (
                          <li key={m.id} className="px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span className="font-medium">
                              {local} vs {visitante}
                            </span>
                            <span className="text-muted-foreground">{m.fase} · {fecha}</span>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
