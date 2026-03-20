import { memo } from 'react'
import { cn } from '@/lib/utils'
import type { Subject } from '@/types/academic'

const statusStyles: Record<Subject['status'], string> = {
  passed: 'bg-green-100 border-green-300 text-green-900',
  in_progress: 'bg-blue-100 border-blue-300 text-blue-900',
  available: 'bg-amber-100 border-amber-300 text-amber-900',
  locked: 'bg-gray-100 border-gray-200 text-gray-400',
}

interface Props {
  subject: Subject
  isSelected?: boolean
  isPrereq?: boolean
  onClick?: (code: string) => void
}

export const SubjectCard = memo(function SubjectCard({
  subject: s,
  isSelected = false,
  isPrereq = false,
  onClick,
}: Props) {
  return (
    <div
      onClick={() => onClick?.(s.code)}
      className={cn(
        'w-[160px] h-[88px] rounded-lg border p-2 text-xs flex flex-col justify-between',
        onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : '',
        statusStyles[s.status],
        isSelected && 'ring-2 ring-offset-1 ring-gray-800',
        isPrereq && 'ring-2 ring-offset-1 ring-orange-400',
      )}
    >
      <div className="font-semibold line-clamp-2 leading-tight">{s.name}</div>
      <div className="flex justify-between items-end opacity-70">
        <span className="font-mono">{s.code}</span>
        <span className="text-right leading-tight">
          {s.nota !== null ? (
            <span className="block font-medium opacity-100">{s.nota.toFixed(1)}</span>
          ) : null}
          <span>{s.credits} cr</span>
        </span>
      </div>
    </div>
  )
})
