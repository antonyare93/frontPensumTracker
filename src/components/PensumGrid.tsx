import { useState, useMemo } from 'react'
import type { Subject } from '@/types/academic'
import { cn } from '@/lib/utils'
import { SubjectCard } from './SubjectCard'

const COLS_VISIBLE = 6

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
    () => semesters.slice(startIndex, startIndex + COLS_VISIBLE),
    [semesters, startIndex],
  )

  const selectedSubject = useMemo(
    () => (selectedCode ? (subjects.find(s => s.code === selectedCode) ?? null) : null),
    [selectedCode, subjects],
  )

  const canGoLeft = startIndex > 0
  const canGoRight = startIndex + COLS_VISIBLE < semesters.length

  function handleCardClick(code: string) {
    setSelectedCode(prev => (prev === code ? null : code))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-wrap gap-4 items-center">
          {LegendDots}
          {selectedSubject ? (
            <span className="text-xs text-gray-400">
              Click en la misma materia para deseleccionar
            </span>
          ) : null}
        </div>

        {semesters.length > COLS_VISIBLE ? (
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={() => setStartIndex(i => i - 1)}
              disabled={!canGoLeft}
              className="w-7 h-7 rounded border border-input flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <span className="text-xs text-gray-400 tabular-nums">
              {startIndex + 1}–{Math.min(startIndex + COLS_VISIBLE, semesters.length)}{' '}
              de {semesters.length}
            </span>
            <button
              onClick={() => setStartIndex(i => i + 1)}
              disabled={!canGoRight}
              className="w-7 h-7 rounded border border-input flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex gap-3">
        {visibleSemesters.map(sem => (
          <div key={sem} className="w-[160px] shrink-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 text-center">
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
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Electivas
          </div>
          <div className="flex flex-wrap gap-2">
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
