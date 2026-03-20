import { useMemo } from 'react'
import type { Subject } from '@/types/academic'
import { cn } from '@/lib/utils'

interface Props {
  subjects: Subject[]
}

export function AvailableSubjectsTable({ subjects }: Props) {
  const available = useMemo(
    () =>
      subjects
        .filter(s => s.status === 'available')
        .sort((a, b) => {
          const semA = a.semester ?? 999
          const semB = b.semester ?? 999
          if (semA !== semB) return semA - semB
          return a.name.localeCompare(b.name)
        }),
    [subjects],
  )

  if (available.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay materias disponibles en este momento.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <tr>
            <th className="px-3 py-2">Sem</th>
            <th className="px-3 py-2">Código</th>
            <th className="px-3 py-2">Materia</th>
            <th className="px-3 py-2">Créditos</th>
            <th className="px-3 py-2">Prerrequisitos</th>
          </tr>
        </thead>
        <tbody>
          {available.map((s, i) => (
            <tr key={s.code} className={cn(i % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
              <td className="px-3 py-2 text-gray-500">{s.semester ?? '—'}</td>
              <td className="px-3 py-2 font-mono text-gray-600">{s.code}</td>
              <td className="px-3 py-2 font-medium text-gray-900">{s.name}</td>
              <td className="px-3 py-2 text-center text-gray-700">{s.credits}</td>
              <td className="px-3 py-2 text-gray-500">
                {s.prerequisites.length > 0 ? s.prerequisites.join(', ') : 'Ninguno'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
