import type { MissingBank, MissingForGraduation } from '@/types/academic'

// El portal solo lista los bancos que faltan: uno ausente está cumplido.
export type BankPortalStatus =
  { kind: 'unknown' } | { kind: 'done' } | { kind: 'missing'; bank: MissingBank }

export function bankPortalStatus(
  name: string,
  missing: MissingForGraduation | undefined,
): BankPortalStatus {
  if (!missing) return { kind: 'unknown' }
  const bank = missing.banks.find(b => b.name === name)
  return bank ? { kind: 'missing', bank } : { kind: 'done' }
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

// Algunos bancos (la práctica) se miden por materias y no por créditos.
export function missingBankText(bank: MissingBank): string {
  if (bank.subjects_missing) {
    const verb = bank.subjects_missing === 1 ? 'falta' : 'faltan'
    return `Te ${verb} ${plural(bank.subjects_missing, 'materia', 'materias')}`
  }
  const verb = bank.credits_missing === 1 ? 'falta' : 'faltan'
  return `Te ${verb} ${plural(bank.credits_missing, 'crédito', 'créditos')} (llevas ${bank.credits_approved} de ${bank.credits_required})`
}
