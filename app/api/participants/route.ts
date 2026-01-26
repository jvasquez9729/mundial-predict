import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/utils/api-error'

// GET - Obtener participantes activos para mostrar en avatares
export async function GET() {
  try {
    const supabase = createServiceClient()

    // Obtener top usuarios ordenados por puntos
    const { data: topUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        nombre_completo,
        email,
        es_admin
      `)
      .eq('es_admin', false)
      .order('creado_en', { ascending: false })
      .limit(10)

    if (usersError) {
      throw usersError
    }

    // Obtener puntos de cada usuario desde la tabla de predicciones o estadísticas
    // Por ahora usamos los usuarios más recientes, pero puedes ajustar para usar puntos
    const usersWithAvatars = (topUsers || []).map((user) => {
      // Generar avatar basado en el nombre o email
      const seed = user.email || user.id
      const initials = user.nombre_completo
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

      return {
        id: user.id,
        nombre_completo: user.nombre_completo,
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`,
        profileUrl: `/dashboard`, // O puedes crear una ruta de perfil pública
        initials,
      }
    })

    // Obtener total de participantes
    const { count: totalParticipants } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('es_admin', false)

    return NextResponse.json({
      success: true,
      participants: usersWithAvatars,
      totalParticipants: totalParticipants || 0,
    })

  } catch (error) {
    return handleApiError('/api/participants', error)
  }
}
