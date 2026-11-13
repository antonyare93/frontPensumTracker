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
  credits_required: number
  credits_approved: number
  subject_codes: string[]
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
}
