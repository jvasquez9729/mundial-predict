'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

interface StatsChartProps {
  stats: {
    puntos_totales: number
    marcadores_exactos: number
    predicciones_correctas: number
    total_predicciones: number
  }
  maxPoints?: number
}

export function StatsChart({ stats, maxPoints = 100 }: StatsChartProps) {
  const chartData = useMemo(() => {
    const accuracy = stats.total_predicciones > 0 
      ? Math.round((stats.predicciones_correctas / stats.total_predicciones) * 100)
      : 0

    return [
      {
        name: 'Puntos',
        value: Math.min(stats.puntos_totales, maxPoints),
        max: maxPoints,
        label: stats.puntos_totales,
      },
      {
        name: 'Exactos',
        value: stats.marcadores_exactos,
        max: stats.total_predicciones || 1,
        label: stats.marcadores_exactos,
      },
      {
        name: 'Precisión',
        value: accuracy,
        max: 100,
        label: `${accuracy}%`,
      },
    ]
  }, [stats, maxPoints])

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical">
        <XAxis type="number" domain={[0, 'dataMax']} hide />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={60}
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-border bg-card p-2 shadow-lg">
                  <p className="font-medium">{payload[0].payload.label}</p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={
                index === 0 ? 'hsl(var(--primary))' :
                index === 1 ? 'hsl(var(--success))' :
                'hsl(var(--accent))'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
