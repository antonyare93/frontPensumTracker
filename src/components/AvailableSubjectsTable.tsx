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
    <>
      <ul className="space-y-2 md:hidden">
        {available.map(s => (
          <li key={s.code} className="rounded-lg border border-border bg-card px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-snug text-foreground">{s.name}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{s.code}</p>
              </div>
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                {s.credits} cr
              </span>
            </div>
            <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div>
                <dt className="inline">Semestre </dt>
                <dd className="inline tabular-nums">{s.semester ?? '—'}</dd>
              </div>
              <div>
                <dt className="inline">Prerreq. </dt>
                <dd className="inline">
                  {s.prerequisites.length > 0 ? s.prerequisites.join(', ') : 'Ninguno'}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
              <tr key={s.code} className={cn(i % 2 === 0 ? 'bg-background' : 'bg-muted/50')}>
                <td className="px-3 py-2 tabular-nums text-muted-foreground">{s.semester ?? '—'}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{s.code}</td>
                <td className="px-3 py-2 font-medium text-foreground">{s.name}</td>
                <td className="px-3 py-2 text-center tabular-nums">{s.credits}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {s.prerequisites.length > 0 ? s.prerequisites.join(', ') : 'Ninguno'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
