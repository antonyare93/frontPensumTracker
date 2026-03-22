export type SubjectStatus = 'passed' | 'in_progress' | 'available' | 'locked'

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

export interface AcademicRecord {
  student_name: string
  program_name: string
  program_code: string
  pensum_version: number
  version_actual: number
  versiones: number[]
  total_credits: number
  completed_credits: number
  in_progress_credits: number
  elective_banks: ElectiveBank[]
  subjects: Subject[]
}
