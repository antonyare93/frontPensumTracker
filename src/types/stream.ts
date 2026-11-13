import type { AcademicRecord, CourseGrades, MissingForGraduation, Subject } from './academic'

// Eventos que el backend emite, uno por línea, mientras arma el expediente.
export interface StudentInfoData {
  student_name: string
  program_name: string
  program_code: string
}

export interface ProgramInfoData {
  pensum_version: number
  version_actual: number
  enrolled_version: number | null
  versiones: number[]
  total_credits: number
}

export type StreamEvent =
  | { stage: 'student_info'; data: StudentInfoData }
  | { stage: 'program_info'; data: ProgramInfoData }
  | { stage: 'pensum'; data: { subjects: Subject[] } }
  | { stage: 'record'; data: AcademicRecord }
  | { stage: 'grades'; data: { courses: CourseGrades[] } }
  | { stage: 'missing'; data: MissingForGraduation }
  | { stage: 'error'; status: number; detail: string }
