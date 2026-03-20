interface Props {
  completed: number
  total: number
}

export function ProgressBar({ completed, total }: Props) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">Progreso de la carrera</span>
        <span className="font-medium">{percent}% — {completed}/{total} créditos</span>
      </div>
      <div className="h-3 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
