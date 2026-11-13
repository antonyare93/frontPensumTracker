import type { MissingBank, MissingForGraduation as Missing, MissingSubject } from '@/types/academic'

interface Props {
  missing: Missing | undefined
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

// El portal mide algunos bancos por materias (la práctica) y otros por créditos.
function bankStatus(bank: MissingBank): string {
  if (bank.subjects_missing) {
    return `Te ${bank.subjects_missing === 1 ? 'falta' : 'faltan'} ${plural(bank.subjects_missing, 'materia', 'materias')}`
  }
  return `Te ${bank.credits_missing === 1 ? 'falta' : 'faltan'} ${plural(bank.credits_missing, 'crédito', 'créditos')} (llevas ${bank.credits_approved} de ${bank.credits_required})`
}

function SubjectList({ subjects }: { subjects: MissingSubject[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {subjects.map(s => (
        <li key={s.code} className="flex justify-between gap-3">
          <span className="min-w-0 text-foreground">{s.name}</span>
          <span className="shrink-0 tabular-nums text-muted-foreground">
            {s.code} · {s.credits} cr
          </span>
        </li>
      ))}
    </ul>
  )
}

// Lo que el portal dice que falta para grado. Es la fuente oficial: si no
// coincide con el cálculo del pensum, manda esta.
export function MissingForGraduation({ missing }: Props) {
  if (!missing) {
    return (
      <p className="text-sm text-muted-foreground">
        No pudimos consultar las materias faltantes en el portal. Intenta de nuevo más tarde.
      </p>
    )
  }
  const { mandatory, banks, pending } = missing
  if (mandatory.length === 0 && banks.length === 0) {
    return <p className="text-sm text-green-700">Según el portal no te falta ninguna materia para grado.</p>
  }

  return (
    <div className="space-y-6">
      {mandatory.length > 0 ? (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Obligatorias ({plural(mandatory.length, 'materia', 'materias')})
          </h3>
          <SubjectList subjects={mandatory} />
        </section>
      ) : null}

      {banks.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Electivas</h3>
          {banks.map(bank => (
            <div key={bank.name} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium text-foreground">{bank.name}</p>
              <p className="mb-2 text-sm text-muted-foreground">{bankStatus(bank)}</p>
              {bank.options.length > 0 ? (
                <>
                  <p className="mb-1 text-xs text-muted-foreground">Puedes cursar:</p>
                  <SubjectList subjects={bank.options} />
                </>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {pending.length > 0 ? (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Con nota pendiente del docente</h3>
          <ul className="space-y-1 text-sm">
            {pending.map(p => (
              <li key={`${p.code}-${p.semester}`} className="text-foreground">
                {p.name} <span className="text-muted-foreground">({p.code}, semestre {p.semester})</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
