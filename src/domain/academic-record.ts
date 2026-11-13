import type { AcademicRecord } from '@/types/academic'
import type { StreamEvent } from '@/types/stream'

// El expediente llega por etapas: mientras tanto le faltan campos.
export type PartialRecord = Partial<AcademicRecord>

export type RecordStatus = 'idle' | 'loading' | 'error'

export interface RecordState {
  status: RecordStatus
  error: string | null
  data: PartialRecord | null
}

export type RecordAction =
  | { type: 'start'; keepData: boolean }
  | { type: 'stage'; event: StreamEvent }
  | { type: 'fail'; message: string }
  | { type: 'done' }
  | { type: 'reset' }

export const initialRecordState: RecordState = { status: 'idle', error: null, data: null }

function mergeStage(data: PartialRecord | null, event: StreamEvent): PartialRecord {
  switch (event.stage) {
    case 'student_info':
    case 'program_info':
    case 'record':
      return { ...data, ...event.data }
    case 'pensum':
      // El backend repite el pensum; una vez calculado el expediente, sus estados mandan.
      if (data?.completed_credits !== undefined) return data
      return { ...data, subjects: event.data.subjects }
    case 'grades':
      return { ...data, current_grades: event.data.courses }
    case 'missing':
      return { ...data, missing: event.data }
    default:
      // Etapa que este cliente no conoce: se ignora. Igual que antes, deja un
      // expediente vacío si aún no había ninguno.
      return data ?? {}
  }
}

export function recordReducer(state: RecordState, action: RecordAction): RecordState {
  switch (action.type) {
    case 'start':
      return { status: 'loading', error: null, data: action.keepData ? state.data : null }
    case 'stage': {
      if (action.event.stage === 'error') {
        return { ...state, status: 'error', error: action.event.detail }
      }
      const data = mergeStage(state.data, action.event)
      return data === state.data ? state : { ...state, data }
    }
    case 'fail':
      return { ...state, status: 'error', error: action.message }
    case 'done':
      return state.status === 'error' ? state : { ...state, status: 'idle' }
    case 'reset':
      return initialRecordState
  }
}
