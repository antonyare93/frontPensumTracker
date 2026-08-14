import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
}

export function GaugeSkeleton() {
  return (
    <div className="animate-pulse">
      <svg viewBox="0 0 200 140" className="w-full" aria-hidden>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={14}
          strokeLinecap="round"
        />
      </svg>
      <div className="mx-auto -mt-12 h-5 w-16 rounded bg-gray-200" />
    </div>
  )
}

export function PensumGridSkeleton() {
  return (
    <div>
      <div className="mb-3 flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, col) => (
          <div key={col} className="min-w-0">
            <Skeleton className="mx-auto mb-2 h-3 w-12" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, row) => (
                <Skeleton key={row} className="h-[88px] w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="h-9 bg-gray-50" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-gray-100 px-3 py-2.5">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  )
}
