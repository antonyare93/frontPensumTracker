import { describe, expect, it } from 'vitest'
import { gradeSummary } from './grades'

describe('gradeSummary', () => {
  it('sin notas no hay acumulado y pide la nota mínima en todo el curso', () => {
    expect(gradeSummary([])).toEqual({
      accumulated: 0,
      finalGrade: 0,
      evaluatedPercent: 0,
      neededGrade: 2.95,
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

  it('calcula la nota que falta en el porcentaje restante para llegar a 2,95', () => {
    // 1,8 acumulado; 2,95 ya se redondea a 3,0: faltan 1,15 en el 50 % restante, 2,3.
    const result = gradeSummary([
      { grade: 4, percent: 30 },
      { grade: 3, percent: 20 },
    ])

    expect(result.neededGrade).toBeCloseTo(2.3)
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

  it('redondea la definitiva a una décima: 2,96 y 2,95 aprueban, 2,94 no', () => {
    const at = (grade: number) => gradeSummary([{ grade, percent: 100 }])

    expect(at(2.96).outcome).toBe('passed')
    expect(at(2.96).finalGrade).toBeCloseTo(3)
    expect(at(2.95).outcome).toBe('passed')
    expect(at(2.94).outcome).toBe('failed')
    expect(at(2.94).finalGrade).toBeCloseTo(2.9)
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
