import { useTransition } from 'react'
import type { PartialRecord } from '@/hooks/useAcademicRecord'
import { ProgressGauge } from './ProgressGauge'
import { PensumGrid } from './PensumGrid'
import { AvailableSubjectsTable } from './AvailableSubjectsTable'
import { ElectiveBanks } from './ElectiveBanks'
import { Skeleton, GaugeSkeleton, PensumGridSkeleton, TableSkeleton } from './Skeletons'

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
  data: PartialRecord
  error: string | null
  onReset: () => void
  onChangeVersion: (version: number) => Promise<void>
}

export function Dashboard({ data, error, onReset, onChangeVersion }: Props) {
  const hasHeader = data.student_name !== undefined
  const hasProgram = data.versiones !== undefined && data.pensum_version !== undefined
  const hasSubjects = Array.isArray(data.subjects)
  const isComplete = data.completed_credits !== undefined

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          {hasHeader ? (
            <>
              <h1 className="text-2xl font-semibold text-gray-900">{data.student_name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{data.program_name}</p>
            </>
          ) : (
            <>
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-40 mt-2" />
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {hasProgram && data.versiones!.length > 1 ? (
            <VersionSelector
              currentVersion={data.pensum_version!}
              versionActual={data.version_actual!}
              versiones={data.versiones!}
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

      {error ? (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="max-w-xs mx-auto mb-8">
        {isComplete ? (
          <ProgressGauge
            completed={data.completed_credits!}
            inProgress={data.in_progress_credits!}
            total={data.total_credits!}
          />
        ) : (
          <GaugeSkeleton />
        )}
      </div>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Pensum</h2>
        {hasSubjects ? <PensumGrid subjects={data.subjects!} /> : <PensumGridSkeleton />}
      </section>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Materias disponibles</h2>
        {isComplete ? <AvailableSubjectsTable subjects={data.subjects!} /> : <TableSkeleton />}
      </section>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Electivas</h2>
        {isComplete ? (
          <ElectiveBanks banks={data.elective_banks!} subjects={data.subjects!} />
        ) : (
          <TableSkeleton rows={3} />
        )}
      </section>
    </div>
  )
}
