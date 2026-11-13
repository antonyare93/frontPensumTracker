import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ElectiveBank, Subject } from '@/types/academic'
import { cn } from '@/lib/utils'
import { indexByCode } from '@/domain/pensum'
import { percentOf } from '@/domain/progress'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SUBJECT_STATUS } from './subject-status'

interface Props {
  bank: ElectiveBank
  subjects: Subject[]
}

export function BankItem({ bank, subjects }: Props) {
  const [open, setOpen] = useState(false)

  const subjectMap = useMemo(() => indexByCode(subjects), [subjects])

  const required = bank.credits_required

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50">
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">{bank.name}</h3>
          <span className="text-xs tabular-nums text-muted-foreground">
            {required === null
              ? `${bank.credits_approved} créditos aprobados · mínimo no disponible`
              : `${bank.credits_approved} / ${required} créditos`}
          </span>
        </div>
        {/* Sin mínimo conocido una barra mentiría sobre el avance. */}
        {required === null ? null : (
          <ProgressBar percent={percentOf(bank.credits_approved, required)} />
        )}
      </div>

      <Button variant="ghost" onClick={() => setOpen(o => !o)} className="w-full">
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {open ? 'Ocultar materias' : `Ver ${bank.subject_codes.length} materias`}
      </Button>

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
                  <Badge className={cn('ml-2 shrink-0', SUBJECT_STATUS[subject.status].badge)}>
                    {SUBJECT_STATUS[subject.status].label}
                  </Badge>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
