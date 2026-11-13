import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { EnrolledOutsidePensum, Subject } from '@/types/academic'
import { gradeSummary, MAX_GRADE, MIN_GRADE, type GradeEntry, type GradeSummary } from '@/domain/grades'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  subjects: Subject[]
  outsidePensum?: EnrolledOutsidePensum[]
}

// Lo que el estudiante escribe, tal cual, para no perder una coma a medio teclear.
interface DraftRow {
  grade: string
  percent: string
}

const EMPTY_ROW: DraftRow = { grade: '', percent: '' }

function parseNumber(value: string): number | null {
  const trimmed = value.trim().replace(',', '.')
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function toEntry(row: DraftRow): GradeEntry {
  return { grade: parseNumber(row.grade), percent: parseNumber(row.percent) }
}

function formatGrade(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

function formatPercent(value: number): string {
  return String(Math.round(value * 100) / 100).replace('.', ',')
}

function outcomeMessage(summary: GradeSummary): { text: string; className: string } {
  const remaining = formatPercent(100 - summary.evaluatedPercent)
  switch (summary.outcome) {
    case 'invalid':
      return { text: 'Los porcentajes suman más de 100 %', className: 'text-red-700' }
    case 'passed':
      return { text: 'Aprobada', className: 'text-green-700' }
    case 'failed':
      return { text: 'Reprobada', className: 'text-red-700' }
    case 'secured':
      return { text: 'Ya tienes la nota para aprobar', className: 'text-green-700' }
    case 'lost':
      return {
        text: `Necesitarías ${formatGrade(summary.neededGrade!)} en el ${remaining} % restante: no alcanza`,
        className: 'text-red-700',
      }
    case 'pending':
      return {
        text: `Necesitas ${formatGrade(summary.neededGrade!)} en el ${remaining} % restante`,
        className: 'text-foreground',
      }
  }
}

// Lo que la tarjeta necesita de una materia. Las que no están en el pensum no
// traen créditos.
interface CurrentSubject {
  code: string
  name: string
  credits: number | null
}

function fromPensum(subject: Subject): CurrentSubject {
  return { code: subject.code, name: subject.name, credits: subject.credits }
}

function fromOutside(subject: EnrolledOutsidePensum): CurrentSubject {
  return { code: subject.code, name: subject.name ?? `Materia ${subject.code}`, credits: null }
}

interface CardProps {
  subject: CurrentSubject
}

function SubjectGrades({ subject }: CardProps) {
  const [rows, setRows] = useState<DraftRow[]>([EMPTY_ROW])
  const summary = gradeSummary(rows.map(toEntry))
  const message = outcomeMessage(summary)

  const updateRow = (index: number, field: keyof DraftRow, value: string) =>
    setRows(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  const addRow = () => setRows(prev => [...prev, EMPTY_ROW])
  const removeRow = (index: number) => setRows(prev => prev.filter((_, i) => i !== index))

  return (
    <li className="min-w-0 rounded-lg border border-border p-4">
      {/* Envuelve para que la etiqueta larga baje de línea en vez de desbordar en móvil. */}
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold text-foreground">{subject.name}</h3>
        <span className="text-xs text-muted-foreground">
          {subject.credits === null
            ? 'No está en el pensum de esta versión'
            : `${subject.code} · ${subject.credits} créditos`}
        </span>
      </div>

      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              inputMode="decimal"
              placeholder={`Nota (${MIN_GRADE} a ${MAX_GRADE})`}
              aria-label={`Nota ${i + 1} de ${subject.name}`}
              value={row.grade}
              onChange={e => updateRow(i, 'grade', e.target.value)}
            />
            <Input
              inputMode="decimal"
              placeholder="%"
              aria-label={`Porcentaje ${i + 1} de ${subject.name}`}
              value={row.percent}
              onChange={e => updateRow(i, 'percent', e.target.value)}
              className="w-24 shrink-0"
            />
            {rows.length > 1 ? (
              <Button
                variant="ghost"
                className="px-2"
                aria-label={`Quitar evaluación ${i + 1} de ${subject.name}`}
                onClick={() => removeRow(i)}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        className="mt-1 px-0"
        aria-label={`Agregar evaluación a ${subject.name}`}
        onClick={addRow}
      >
        <Plus className="size-4" aria-hidden="true" /> Agregar evaluación
      </Button>

      <div className="mt-2 text-sm" aria-live="polite">
        <p className="text-muted-foreground">
          Acumulado: {formatGrade(summary.accumulated)} de {formatPercent(summary.evaluatedPercent)} % evaluado
        </p>
        <p className={message.className}>{message.text}</p>
      </div>
    </li>
  )
}

// Calculadora de notas de las materias en curso. Las notas solo viven en la
// pestaña: no se envían ni se guardan, igual que el resto del expediente.
export function GradeCalculator({ subjects, outsidePensum = [] }: Props) {
  const current = [
    ...subjects.filter(s => s.cursando).map(fromPensum),
    ...outsidePensum.map(fromOutside),
  ]

  if (current.length === 0) {
    return <p className="text-sm text-muted-foreground">No tienes materias matriculadas este semestre.</p>
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Escribe tus notas y el porcentaje de cada evaluación. Se aprueba con 3,0. Las notas no se
        guardan: se borran al cerrar o recargar la página.
      </p>
      <ul className="grid gap-4 md:grid-cols-2">
        {current.map(subject => (
          <SubjectGrades key={subject.code} subject={subject} />
        ))}
      </ul>
    </>
  )
}
