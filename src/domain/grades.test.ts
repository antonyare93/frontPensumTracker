import { describe, expect, it } from 'vitest'
import { gradeSummary, PASSING_GRADE } from './grades'

describe('gradeSummary', () => {
  it('sin notas no hay acumulado y pide la nota mínima en todo el curso', () => {
    expect(gradeSummary([])).toEqual({
      accumulated: 0,
      evaluatedPercent: 0,
      neededGrade: PASSING_GRADE,
      outcome: 'pending',
    })
  })

  it('suma cada nota ponderada por su porcentaje', () => {
    const result = gradeSummary([
      { grade: 4, percent: 30 },
      { grade: 3, percent: 20 },
    ])

    expect(result.accumulated).toBeCloseTo(1.8)
    expect(result.evaluatedPercent).toBe(50)
  })

  it('calcula la nota que falta en el porcentaje restante para llegar a 3,0', () => {
    // 1,8 acumulado; faltan 1,2 en el 50 % restante: 2,4.
    const result = gradeSummary([
      { grade: 4, percent: 30 },
      { grade: 3, percent: 20 },
    ])

    expect(result.neededGrade).toBeCloseTo(2.4)
    expect(result.outcome).toBe('pending')
  })

  it('marca la materia como asegurada cuando el acumulado ya alcanza 3,0', () => {
    const result = gradeSummary([{ grade: 5, percent: 60 }])

    expect(result.neededGrade).toBe(0)
    expect(result.outcome).toBe('secured')
  })

  it('marca la materia como perdida cuando haría falta más de 5,0', () => {
    const result = gradeSummary([{ grade: 0, percent: 50 }, { grade: 0.5, percent: 20 }])

    expect(result.neededGrade).toBeGreaterThan(5)
    expect(result.outcome).toBe('lost')
  })

  it('con el 100 % evaluado da aprobada o reprobada según el acumulado', () => {
    expect(gradeSummary([{ grade: 3, percent: 100 }]).outcome).toBe('passed')
    expect(gradeSummary([{ grade: 2.9, percent: 100 }]).outcome).toBe('failed')
    expect(gradeSummary([{ grade: 3, percent: 100 }]).neededGrade).toBeNull()
  })

  it('ignora las filas sin nota o sin porcentaje', () => {
    const result = gradeSummary([
      { grade: null, percent: 30 },
      { grade: 4, percent: null },
      { grade: 4, percent: 25 },
    ])

    expect(result.accumulated).toBeCloseTo(1)
    expect(result.evaluatedPercent).toBe(25)
  })

  it('marca como inválido un porcentaje evaluado mayor a 100', () => {
    expect(gradeSummary([{ grade: 4, percent: 60 }, { grade: 4, percent: 50 }]).outcome).toBe('invalid')
  })
})
