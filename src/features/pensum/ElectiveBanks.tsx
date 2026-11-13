import type { ElectiveBank, MissingForGraduation, Subject } from '@/types/academic'
import { bankPortalStatus } from '@/domain/graduation'
import { BankItem } from './BankItem'

interface Props {
  banks: ElectiveBank[]
  subjects: Subject[]
  // Faltantes del portal: manda sobre el cálculo propio cuando llega.
  missing?: MissingForGraduation
}

export function ElectiveBanks({ banks, subjects, missing }: Props) {
  if (banks.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay bancos de electivas registrados.</p>
  }

  return (
    <div className="space-y-4">
      {banks.map(bank => (
        <BankItem
          key={bank.name}
          bank={bank}
          subjects={subjects}
          portal={bankPortalStatus(bank.name, missing)}
        />
      ))}
    </div>
  )
}
