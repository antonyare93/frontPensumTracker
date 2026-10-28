// Escala de notas de la universidad: 0 a 5, se aprueba con 3,0.
export const MIN_GRADE = 0
export const MAX_GRADE = 5
export const PASSING_GRADE = 3

// Una evaluación tal como la escribe el estudiante. Los campos vacíos llegan como null.
export interface GradeEntry {
  grade: number | null
  percent: number | null
}

export type GradeOutcome = 'pending' | 'secured' | 'lost' | 'passed' | 'failed' | 'invalid'

export interface GradeSummary {
  accumulated: number
  evaluatedPercent: number
  // Nota que hace falta en lo que queda del curso. null cuando ya se evaluó el 100 %.
  neededGrade: number | null
  outcome: GradeOutcome
}

const EPSILON = 1e-9

function isComplete(entry: GradeEntry): entry is { grade: number; percent: number } {
  return entry.grade !== null && entry.percent !== null
}

export function gradeSummary(entries: readonly GradeEntry[]): GradeSummary {
  const complete = entries.filter(isComplete)
  const accumulated = complete.reduce((sum, e) => sum + (e.grade * e.percent) / 100, 0)
  const evaluatedPercent = complete.reduce((sum, e) => sum + e.percent, 0)
  const remainingPercent = 100 - evaluatedPercent

  if (remainingPercent < -EPSILON) {
    return { accumulated, evaluatedPercent, neededGrade: null, outcome: 'invalid' }
  }
  if (remainingPercent <= EPSILON) {
    const outcome = accumulated + EPSILON >= PASSING_GRADE ? 'passed' : 'failed'
    return { accumulated, evaluatedPercent, neededGrade: null, outcome }
  }

  const neededGrade = Math.max(0, ((PASSING_GRADE - accumulated) * 100) / remainingPercent)
  const outcome = neededGrade <= EPSILON ? 'secured' : neededGrade > MAX_GRADE ? 'lost' : 'pending'
  return { accumulated, evaluatedPercent, neededGrade, outcome }
}
