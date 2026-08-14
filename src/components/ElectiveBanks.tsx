import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ElectiveBank, Subject } from '@/types/academic'
import { cn } from '@/lib/utils'

const statusStyles: Record<Subject['status'], string> = {
  passed: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  available: 'bg-amber-100 text-amber-800',
  locked: 'bg-gray-100 text-gray-500',
  not_needed: 'bg-gray-50 text-gray-400',
}

const statusLabel: Record<Subject['status'], string> = {
  passed: 'Aprobada',
  in_progress: 'En curso',
  available: 'Disponible',
  locked: 'Bloqueada',
  not_needed: 'No requerida',
}

interface BankItemProps {
  bank: ElectiveBank
  subjects: Subject[]
}

function BankItem({ bank, subjects }: BankItemProps) {
  const [open, setOpen] = useState(false)

  const subjectMap = useMemo(
    () => new Map(subjects.map(s => [s.code, s])),
    [subjects],
  )

  const percent =
    bank.credits_required > 0
      ? Math.min(100, Math.round((bank.credits_approved / bank.credits_required) * 100))
      : 0

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50">
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">{bank.name}</h3>
          <span className="text-xs tabular-nums text-muted-foreground">
            {bank.credits_approved} / {bank.credits_required} créditos
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => setOpen(o => !o)}
        className="flex min-h-11 w-full cursor-pointer items-center gap-1 px-4 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {open ? 'Ocultar materias' : `Ver ${bank.subject_codes.length} materias`}
      </button>

      {open ? (
        <ul className="divide-y divide-gray-100">
          {bank.subject_codes.map(code => {
            const subject = subjectMap.get(code)
            return (
              <li key={code} className="flex items-center justify-between px-4 py-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-gray-400 shrink-0">{code}</span>
                  <span className="truncate text-gray-800">{subject?.name ?? '—'}</span>
                </div>
                {subject ? (
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full shrink-0 ml-2',
                      statusStyles[subject.status],
                    )}
                  >
                    {statusLabel[subject.status]}
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

interface Props {
  banks: ElectiveBank[]
  subjects: Subject[]
}

export function ElectiveBanks({ banks, subjects }: Props) {
  if (banks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No hay bancos de electivas registrados.</p>
    )
  }

  return (
    <div className="space-y-4">
      {banks.map(bank => (
        <BankItem key={bank.name} bank={bank} subjects={subjects} />
      ))}
    </div>
  )
}
