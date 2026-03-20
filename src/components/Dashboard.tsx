import { useTransition } from 'react'
import type { AcademicRecord } from '@/types/academic'
import { ProgressGauge } from './ProgressGauge'
import { PensumGrid } from './PensumGrid'
import { AvailableSubjectsTable } from './AvailableSubjectsTable'
import { ElectiveBanks } from './ElectiveBanks'

interface VersionSelectorProps {
  currentVersion: number
  versionActual: number
  versiones: number[]
  onChangeVersion: (version: number) => Promise<void>
}

function VersionSelector({ currentVersion, versionActual, versiones, onChangeVersion }: VersionSelectorProps) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    startTransition(async () => {
      await onChangeVersion(Number(e.target.value))
    })
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-500 whitespace-nowrap">Versión del pensum</label>
      <select
        value={currentVersion}
        onChange={handleChange}
        disabled={isPending}
        className="text-sm border border-input rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        {versiones.map(v => (
          <option key={v} value={v}>
            {v}{v === versionActual ? ' (actual)' : ''}
          </option>
        ))}
      </select>
      {isPending ? <span className="text-xs text-gray-400">Cargando...</span> : null}
    </div>
  )
}

interface Props {
  record: AcademicRecord
  onReset: () => void
  onChangeVersion: (version: number) => Promise<void>
}

export function Dashboard({ record, onReset, onChangeVersion }: Props) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{record.student_name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{record.program_name}</p>
        </div>
        <div className="flex items-center gap-4">
          {record.versiones.length > 1 ? (
            <VersionSelector
              currentVersion={record.pensum_version}
              versionActual={record.version_actual}
              versiones={record.versiones}
              onChangeVersion={onChangeVersion}
            />
          ) : null}
          <button
            onClick={onReset}
            className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-800"
          >
            Cambiar sesión
          </button>
        </div>
      </div>

      <div className="max-w-xs mx-auto mb-8">
        <ProgressGauge
          completed={record.completed_credits}
          inProgress={record.in_progress_credits}
          total={record.total_credits}
        />
      </div>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Pensum</h2>
        <PensumGrid subjects={record.subjects} />
      </section>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Materias disponibles</h2>
        <AvailableSubjectsTable subjects={record.subjects} />
      </section>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Electivas</h2>
        <ElectiveBanks banks={record.elective_banks} subjects={record.subjects} />
      </section>
    </div>
  )
}
