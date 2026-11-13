// Escala de notas de la universidad: 0 a 5, se aprueba con 3,0.
export const MIN_GRADE = 0
export const MAX_GRADE = 5
export const PASSING_GRADE = 3
// La definitiva se redondea a una décima: desde 2,95 queda en 3,0 y aprueba.
const PASSING_THRESHOLD = 2.95

// Una evaluación tal como la escribe el estudiante. Los campos vacíos llegan como null.
export interface GradeEntry {
  grade: number | null
  percent: number | null
}

export type GradeOutcome = 'pending' | 'secured' | 'lost' | 'passed' | 'failed' | 'invalid'

export interface GradeSummary {
  accumulated: number
  // Acumulado redondeado a una décima, como queda la definitiva.
  finalGrade: number
  evaluatedPercent: number
  // Nota que hace falta en lo que queda del curso. null cuando ya se evaluó el 100 %.
  neededGrade: number | null
  outcome: GradeOutcome
}

const EPSILON = 1e-9

// Media arriba: 2,95 → 3,0. El EPSILON evita que 2,95 en coma flotante baje a 2,9.
function roundToTenth(value: number): number {
  return Math.floor(value * 10 + 0.5 + EPSILON) / 10
}

function isComplete(entry: GradeEntry): entry is { grade: number; percent: number } {
  return entry.grade !== null && entry.percent !== null
}

export function gradeSummary(entries: readonly GradeEntry[]): GradeSummary {
  const complete = entries.filter(isComplete)
  const accumulated = complete.reduce((sum, e) => sum + (e.grade * e.percent) / 100, 0)
  const evaluatedPercent = complete.reduce((sum, e) => sum + e.percent, 0)
  const remainingPercent = 100 - evaluatedPercent
  const finalGrade = roundToTenth(accumulated)

  if (remainingPercent < -EPSILON) {
    return {
      accumulated,
      finalGrade,
      evaluatedPercent,
      neededGrade: null,
      outcome: 'invalid',
    }
  }
  if (remainingPercent <= EPSILON) {
    const outcome = finalGrade + EPSILON >= PASSING_GRADE ? 'passed' : 'failed'
    return {
      accumulated,
      finalGrade,
      evaluatedPercent,
      neededGrade: null,
      outcome,
    }
  }

  const neededGrade = Math.max(0, ((PASSING_THRESHOLD - accumulated) * 100) / remainingPercent)
  const outcome = neededGrade <= EPSILON ? 'secured' : neededGrade > MAX_GRADE ? 'lost' : 'pending'
  return { accumulated, finalGrade, evaluatedPercent, neededGrade, outcome }
}
