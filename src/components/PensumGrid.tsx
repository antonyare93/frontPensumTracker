import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Subject } from '@/types/academic'
import { cn } from '@/lib/utils'
import { SubjectCard } from './SubjectCard'

function useVisibleCols() {
  const [cols, setCols] = useState(2)

  useEffect(() => {
    const queries = [
      { mq: window.matchMedia('(min-width: 1024px)'), n: 6 },
      { mq: window.matchMedia('(min-width: 768px)'), n: 4 },
      { mq: window.matchMedia('(min-width: 640px)'), n: 3 },
    ]

    const update = () => {
      setCols(queries.find(q => q.mq.matches)?.n ?? 2)
    }

    update()
    for (const q of queries) q.mq.addEventListener('change', update)
    return () => {
      for (const q of queries) q.mq.removeEventListener('change', update)
    }
  }, [])

  return cols
}

// Hoisted: static, never changes between renders
const legendItems = [
  { status: 'passed' as const, label: 'Aprobada', color: 'bg-green-400' },
  { status: 'in_progress' as const, label: 'En curso', color: 'bg-blue-400' },
  { status: 'available' as const, label: 'Disponible', color: 'bg-amber-400' },
  { status: 'locked' as const, label: 'Bloqueada', color: 'bg-gray-300' },
]

const LegendDots = legendItems.map(item => (
  <span key={item.status} className="flex items-center gap-1 text-xs text-gray-600">
    <span className={cn('inline-block w-3 h-3 rounded-sm', item.color)} />
    {item.label}
  </span>
))

interface Props {
  subjects: Subject[]
}

export function PensumGrid({ subjects }: Props) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [startIndex, setStartIndex] = useState(0)
  const colsVisible = useVisibleCols()

  const electives = useMemo(
    () => subjects.filter(s => s.semester === 0 || s.semester === null || s.semester === 99),
    [subjects],
  )

  const bySemester = useMemo(
    () =>
      subjects.reduce<Record<number, Subject[]>>((acc, s) => {
        const sem = s.semester ?? 0
        if (sem === 0 || sem === 99) return acc
        acc[sem] = acc[sem] ?? []
        acc[sem].push(s)
        return acc
      }, {}),
    [subjects],
  )

  const semesters = useMemo(
    () => Object.keys(bySemester).map(Number).sort((a, b) => a - b),
    [bySemester],
  )

  const visibleSemesters = useMemo(
    () => semesters.slice(startIndex, startIndex + colsVisible),
    [semesters, startIndex, colsVisible],
  )

  useEffect(() => {
    setStartIndex(i => Math.min(i, Math.max(0, semesters.length - colsVisible)))
  }, [colsVisible, semesters.length])

  const selectedSubject = useMemo(
    () => (selectedCode ? (subjects.find(s => s.code === selectedCode) ?? null) : null),
    [selectedCode, subjects],
  )

  const subjectsByCode = useMemo(() => {
    const map = new Map<string, Subject>()
    for (const s of subjects) map.set(s.code, s)
    return map
  }, [subjects])

  const selectedPrereqs = useMemo(() => {
    if (!selectedSubject) return []
    return selectedSubject.prerequisites.map(code => {
      const found = subjectsByCode.get(code)
      return { code, name: found?.name ?? code }
    })
  }, [selectedSubject, subjectsByCode])

  const canGoLeft = startIndex > 0
  const canGoRight = startIndex + colsVisible < semesters.length

  function handleCardClick(code: string) {
    setSelectedCode(prev => (prev === code ? null : code))
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Pensum</h2>
        {semesters.length > colsVisible ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setStartIndex(i => i - 1)}
              disabled={!canGoLeft}
              aria-label="Semestres anteriores"
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-input text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <span className="text-xs tabular-nums text-muted-foreground">
              {startIndex + 1}–{Math.min(startIndex + colsVisible, semesters.length)}{' '}
              de {semesters.length}
            </span>
            <button
              type="button"
              onClick={() => setStartIndex(i => i + 1)}
              disabled={!canGoRight}
              aria-label="Semestres siguientes"
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-input text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        {LegendDots}
        {selectedSubject ? (
          <span className="text-xs text-muted-foreground">
            Toca de nuevo para deseleccionar
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Toca una materia para ver prerrequisitos
          </span>
        )}
      </div>

      {selectedSubject ? (
        <div
          role="status"
          aria-live="polite"
          className="mb-3 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-950"
        >
          <p className="font-medium leading-snug">{selectedSubject.name}</p>
          {selectedPrereqs.length > 0 ? (
            <ul className="mt-1.5 space-y-1 text-sm leading-snug text-orange-900/90">
              {selectedPrereqs.map(p => (
                <li key={p.code}>
                  <span className="font-mono text-xs opacity-70">{p.code}</span>
                  <span className="mx-1.5 text-orange-300" aria-hidden="true">
                    ·
                  </span>
                  {p.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-orange-900/80">Sin prerrequisitos</p>
          )}
        </div>
      ) : null}

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${visibleSemesters.length}, minmax(0, 1fr))` }}>
        {visibleSemesters.map(sem => (
          <div key={sem} className="min-w-0">
            <div className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {sem === 0 ? 'Libre' : `Sem ${sem}`}
            </div>
            <div className="flex flex-col gap-2">
              {bySemester[sem].map(s => (
                <SubjectCard
                  key={s.code}
                  subject={s}
                  isSelected={selectedCode === s.code}
                  isPrereq={selectedSubject?.prerequisites.includes(s.code) ?? false}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {electives.length > 0 ? (
        <div className="mt-8">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Electivas
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {electives.map(s => (
              <SubjectCard
                key={s.code}
                subject={s}
                isSelected={selectedCode === s.code}
                isPrereq={selectedSubject?.prerequisites.includes(s.code) ?? false}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
