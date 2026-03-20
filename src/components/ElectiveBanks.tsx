import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ElectiveBank, Subject } from '@/types/academic'
import { cn } from '@/lib/utils'

const statusStyles: Record<Subject['status'], string> = {
  passed: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  available: 'bg-amber-100 text-amber-800',
  locked: 'bg-gray-100 text-gray-500',
}

const statusLabel: Record<Subject['status'], string> = {
  passed: 'Aprobada',
  in_progress: 'En curso',
  available: 'Disponible',
  locked: 'Bloqueada',
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
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800">{bank.name}</h3>
          <span className="text-xs text-gray-500">
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
        className="w-full flex items-center gap-1 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
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
