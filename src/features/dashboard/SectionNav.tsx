import { BookOpen, ClipboardList, GraduationCap, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Section = 'summary' | 'grades' | 'missing' | 'electives'

const SECTIONS: readonly { id: Section; label: string; icon: LucideIcon }[] = [
  { id: 'summary', label: 'Resumen', icon: BookOpen },
  { id: 'grades', label: 'Notas', icon: ClipboardList },
  { id: 'missing', label: 'Faltantes', icon: GraduationCap },
  { id: 'electives', label: 'Electivas', icon: Layers },
]

interface Props {
  current: Section
  onChange: (section: Section) => void
}

// Pestañas arriba en escritorio y barra fija abajo en móvil: el mismo menú.
export function SectionNav({ current, onChange }: Props) {
  return (
    <nav
      aria-label="Secciones"
      className={cn(
        'fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]',
        'md:static md:mb-8 md:border-t-0 md:border-b md:pb-0',
      )}
    >
      <ul className="mx-auto flex max-w-6xl md:gap-2">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const active = id === current
          return (
            <li key={id} className="flex-1 md:flex-none">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 w-full cursor-pointer flex-col items-center justify-center gap-0.5 text-xs transition-colors duration-200',
                  'md:min-h-11 md:flex-row md:gap-2 md:border-b-2 md:px-3 md:text-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'font-semibold text-foreground md:border-foreground'
                    : 'text-muted-foreground hover:text-foreground md:border-transparent',
                )}
              >
                <Icon className="size-5 md:size-4" aria-hidden="true" />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
