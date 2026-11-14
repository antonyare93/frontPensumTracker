export type SubjectStatus = 'passed' | 'in_progress' | 'available' | 'locked' | 'not_needed'

export interface Subject {
  code: string
  name: string
  credits: number
  semester: number | null
  obligatoria: boolean
  elective_bank: string | null
  prerequisites: string[]
  corequisites: string[]
  cursada: boolean
  nota: number | null
  cursando: boolean
  status: SubjectStatus
}

export interface ElectiveBank {
  name: string
  // null cuando el backend no tiene el mínimo oficial del banco para esta versión.
  credits_required: number | null
  credits_approved: number
  subject_codes: string[]
  // Del back: llegó al mínimo o completó otro énfasis de su grupo. null si no hay mínimo.
  satisfied?: boolean | null
}

// Matriculada que no está en el pensum de la versión elegida. La constancia no
// siempre trae el nombre.
export interface EnrolledOutsidePensum {
  code: string
  name: string | null
}

export interface AcademicRecord {
  student_name: string
  program_name: string
  program_code: string
  pensum_version: number
  version_actual: number
  enrolled_version: number | null
  versiones: number[]
  total_credits: number
  completed_credits: number
  progress_credits: number
  in_progress_credits: number
  graduated: boolean
  elective_banks: ElectiveBank[]
  subjects: Subject[]
  // Opcional: un backend anterior no lo manda.
  enrolled_outside_pensum?: EnrolledOutsidePensum[]
  // Llega en una etapa aparte, después del expediente. Falta si el portal falló.
  current_grades?: CourseGrades[]
  // Faltantes según el portal. Falta si el portal falló.
  missing?: MissingForGraduation
}

// Evaluaciones que el docente programó en el portal. La nota falta si aún no la
// sube o si el estudiante no ha respondido la encuesta docente.
export interface PortalEvaluation {
  name: string
  percent: number
  grade: number | null
}

export interface CourseGrades {
  code: string
  name: string
  evaluations: PortalEvaluation[]
  survey_pending: boolean
}

// Faltantes para grado tal como los reporta el portal (ayudame2).
export interface MissingSubject {
  code: string
  name: string
  credits: number
}

export interface MissingBank {
  name: string
  credits_required: number
  credits_approved: number
  credits_missing: number
  subjects_required: number | null
  subjects_approved: number | null
  subjects_missing: number | null
  options: MissingSubject[]
}

export interface PendingGrade {
  code: string
  name: string
  semester: string
}

export interface MissingForGraduation {
  mandatory: MissingSubject[]
  banks: MissingBank[]
  pending: PendingGrade[]
}
