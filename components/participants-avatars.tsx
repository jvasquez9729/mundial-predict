'use client'

import { useEffect, useState } from 'react'
import { AvatarCircles } from '@/components/ui/avatar-circles'
import { BlurFade } from '@/components/ui/blur-fade'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Trophy, Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

interface Participant {
  id: string
  nombre_completo: string
  imageUrl: string
  profileUrl: string
  initials?: string
}

interface ParticipantsAvatarsProps {
  totalParticipants?: number
  topUsers?: Array<{ imageUrl: string; profileUrl: string }>
}

export function ParticipantsAvatars({ 
  totalParticipants: propTotalParticipants,
  topUsers: customTopUsers 
}: ParticipantsAvatarsProps) {
  const { t } = useTranslation()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchParticipants() {
      try {
        const res = await fetch('/api/participants')
        const data = await res.json()

        if (data.success) {
          const formattedParticipants = data.participants.slice(0, 6).map((p: any) => ({
            imageUrl: p.imageUrl,
            profileUrl: p.profileUrl,
          }))
          setParticipants(formattedParticipants)
          setTotalParticipants(data.totalParticipants || 0)
        }
      } catch (error) {
        console.error('Error fetching participants:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!customTopUsers) {
      fetchParticipants()
    } else {
      setParticipants(customTopUsers)
      setLoading(false)
    }
  }, [customTopUsers])

  const users = customTopUsers || participants
  const total = propTotalParticipants || totalParticipants
  const remainingCount = total > users.length ? total - users.length : 0

  if (loading) {
    return (
      <BlurFade delay={0.4} direction="up">
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Jugadores Activos</CardTitle>
              </div>
              <Trophy className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </BlurFade>
    )
  }

  return (
    <BlurFade delay={0.4} direction="up">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Jugadores Activos</CardTitle>
            </div>
            <Trophy className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {users.length > 0 ? (
              <>
                <AvatarCircles
                  numPeople={remainingCount > 0 ? remainingCount : undefined}
                  avatarUrls={users}
                  className="justify-center"
                />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {total.toLocaleString()}+
                  </p>
                  <p className="text-sm text-muted-foreground">
                    participantes activos
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Aún no hay participantes
                </p>
                <p className="text-xs text-muted-foreground">
                  ¡Regístrate para aparecer aquí y competir por el primer lugar!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
