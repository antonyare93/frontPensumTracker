import { useState } from 'react'
import type { PartialRecord } from '@/domain/academic-record'
import { Alert } from '@/components/ui/Alert'
import { Collapsible } from '@/components/ui/Collapsible'
import { GradeCalculator } from '@/features/grades/GradeCalculator'
import { MissingForGraduation } from '@/features/graduation/MissingForGraduation'
import { AvailableSubjects } from '@/features/pensum/AvailableSubjects'
import { ElectiveBanks } from '@/features/pensum/ElectiveBanks'
import { PensumGrid } from '@/features/pensum/PensumGrid'
import { PensumGridSkeleton, TableSkeleton } from '@/features/pensum/skeletons'
import { CreditsSummary } from './CreditsSummary'
import { DashboardHeader } from './DashboardHeader'
import { GaugeSkeleton } from './skeletons'
import { SectionNav, type Section } from './SectionNav'
import { VersionSelector } from './VersionSelector'

interface Props {
  data: PartialRecord
  error: string | null
  onReset: () => void
  onChangeVersion: (version: number) => Promise<void>
}

// El expediente llega por etapas: cada bloque se pinta cuando ya tiene sus datos.
export function Dashboard({ data, error, onReset, onChangeVersion }: Props) {
  const hasProgram = data.versiones !== undefined && data.pensum_version !== undefined
  const hasSubjects = Array.isArray(data.subjects)
  const isComplete = data.completed_credits !== undefined
  const [section, setSection] = useState<Section>('summary')

  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 pb-24 md:p-6">
      <DashboardHeader
        studentName={data.student_name}
        programName={data.program_name}
        onReset={onReset}
        versionSelector={
          hasProgram && data.versiones!.length > 1 ? (
            <VersionSelector
              currentVersion={data.pensum_version!}
              versionActual={data.version_actual!}
              enrolledVersion={data.enrolled_version}
              versiones={data.versiones!}
              onChangeVersion={onChangeVersion}
            />
          ) : null
        }
      />

      {error ? (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      ) : null}

      {data.graduated ? (
        <Alert variant="success" className="mb-6">
          Completaste todos los créditos del plan. No tienes materias pendientes para el grado.
        </Alert>
      ) : null}

      <SectionNav current={section} onChange={setSection} />

      {section === 'summary' ? (
        <>
          <div className="mx-auto mb-8 max-w-xs">
            {isComplete ? (
              <CreditsSummary
                towardDegree={data.progress_credits!}
                inProgress={data.in_progress_credits!}
                total={data.total_credits!}
                takenTotal={data.completed_credits!}
              />
            ) : (
              <GaugeSkeleton />
            )}
          </div>

          <section className="mb-10">
            {hasSubjects ? (
              <PensumGrid subjects={data.subjects!} />
            ) : (
              <>
                <h2 className="mb-4 text-base font-semibold text-foreground">Pensum</h2>
                <PensumGridSkeleton />
              </>
            )}
          </section>

          <Collapsible title="Materias disponibles">
            {isComplete ? <AvailableSubjects subjects={data.subjects!} /> : <TableSkeleton />}
          </Collapsible>
        </>
      ) : null}

      {section === 'grades' ? (
        <section>
          <h2 className="mb-4 text-base font-semibold text-foreground">Notas del semestre</h2>
          {isComplete ? (
            <GradeCalculator
              subjects={data.subjects!}
              outsidePensum={data.enrolled_outside_pensum}
              portalGrades={data.current_grades}
            />
          ) : (
            <TableSkeleton rows={2} />
          )}
        </section>
      ) : null}

      {section === 'missing' ? (
        <section>
          <h2 className="mb-4 text-base font-semibold text-foreground">Faltantes para grado</h2>
          {isComplete ? (
            <MissingForGraduation missing={data.missing} />
          ) : (
            <TableSkeleton rows={3} />
          )}
        </section>
      ) : null}

      {section === 'electives' ? (
        <section>
          <h2 className="mb-4 text-base font-semibold text-foreground">Electivas</h2>
          {isComplete ? (
            <ElectiveBanks
              banks={data.elective_banks!}
              subjects={data.subjects!}
              missing={data.missing}
            />
          ) : (
            <TableSkeleton rows={3} />
          )}
        </section>
      ) : null}
    </div>
  )
}
