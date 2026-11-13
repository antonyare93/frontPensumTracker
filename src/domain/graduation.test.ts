import { describe, expect, it } from 'vitest'
import type { MissingBank, MissingForGraduation } from '@/types/academic'
import { bankPortalStatus, missingBankText } from './graduation'

const practica: MissingBank = {
  name: 'PRACTICA',
  credits_required: 0,
  credits_approved: 0,
  credits_missing: 0,
  subjects_required: 1,
  subjects_approved: 0,
  subjects_missing: 1,
  options: [],
}
const socio: MissingBank = {
  ...practica,
  name: 'SOCIO',
  credits_required: 11,
  credits_approved: 8,
  credits_missing: 3,
  subjects_required: null,
  subjects_approved: null,
  subjects_missing: null,
}
const missing: MissingForGraduation = { mandatory: [], banks: [practica, socio], pending: [] }

describe('bankPortalStatus', () => {
  it('sin datos del portal no dice nada', () => {
    expect(bankPortalStatus('SOCIO', undefined)).toEqual({ kind: 'unknown' })
  })

  it('un banco que el portal lista como faltante trae lo que falta', () => {
    expect(bankPortalStatus('SOCIO', missing)).toEqual({ kind: 'missing', bank: socio })
  })

  it('un banco que el portal no lista está cumplido', () => {
    expect(bankPortalStatus('ARQUITECTURA', missing)).toEqual({ kind: 'done' })
  })
})

describe('missingBankText', () => {
  it('cuenta por materias cuando el banco se mide así', () => {
    expect(missingBankText(practica)).toBe('Te falta 1 materia')
  })

  it('cuenta por créditos en los demás', () => {
    expect(missingBankText(socio)).toBe('Te faltan 3 créditos (llevas 8 de 11)')
  })
})
