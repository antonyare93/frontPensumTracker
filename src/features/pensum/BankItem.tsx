import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ElectiveBank, Subject } from '@/types/academic'
import { cn } from '@/lib/utils'
import { indexByCode } from '@/domain/pensum'
import { percentOf } from '@/domain/progress'
import { missingBankText, type BankPortalStatus } from '@/domain/graduation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SUBJECT_STATUS } from './subject-status'

interface Props {
  bank: ElectiveBank
  subjects: Subject[]
  portal?: BankPortalStatus
}

// Texto y barra del encabezado. Lo del portal manda; sin él, el cálculo propio.
function header(
  bank: ElectiveBank,
  portal: BankPortalStatus,
): { text: string; percent: number | null } {
  if (portal.kind === 'done') {
    return {
      text: `${bank.credits_approved} créditos aprobados · cumplido`,
      percent: 100,
    }
  }
  if (portal.kind === 'missing') {
    const p = portal.bank
    const percent = p.subjects_required
      ? percentOf(p.subjects_approved ?? 0, p.subjects_required)
      : p.credits_required > 0
        ? percentOf(p.credits_approved, p.credits_required)
        : null
    return { text: missingBankText(p), percent }
  }
  const required = bank.credits_required
  // Sin mínimo conocido una barra mentiría sobre el avance.
  return required === null
    ? {
        text: `${bank.credits_approved} créditos aprobados · mínimo no disponible`,
        percent: null,
      }
    : {
        text: `${bank.credits_approved} / ${required} créditos`,
        percent: percentOf(bank.credits_approved, required),
      }
}

export function BankItem({ bank, subjects, portal = { kind: 'unknown' } }: Props) {
  const [open, setOpen] = useState(false)

  const subjectMap = useMemo(() => indexByCode(subjects), [subjects])

  const { text, percent } = header(bank, portal)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50">
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">{bank.name}</h3>
          <span className="text-xs tabular-nums text-muted-foreground">{text}</span>
        </div>
        {percent === null ? null : <ProgressBar percent={percent} />}
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
