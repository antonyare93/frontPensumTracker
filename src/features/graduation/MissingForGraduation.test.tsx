import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { MissingForGraduation as Missing } from '@/types/academic'
import { MissingForGraduation } from './MissingForGraduation'

const missing: Missing = {
  mandatory: [{ code: '2567503', name: 'LAB INTEGRADO DE FISICA', credits: 1 }],
  banks: [
    {
      name: 'PRACTICA ACADEMICA A DISTANCIA',
      credits_required: 0,
      credits_approved: 0,
      credits_missing: 0,
      subjects_required: 1,
      subjects_approved: 0,
      subjects_missing: 1,
      options: [{ code: '2554600', name: 'TRABAJO DE GRADO', credits: 0 }],
    },
    {
      name: 'SOCIOHUMANISTICAS',
      credits_required: 11,
      credits_approved: 8,
      credits_missing: 3,
      subjects_required: null,
      subjects_approved: null,
      subjects_missing: null,
      options: [],
    },
  ],
  pending: [{ code: '2554601', name: 'SEMESTRE DE INDUSTRIA', semester: '20242' }],
}

describe('MissingForGraduation', () => {
  it('muestra obligatorias, bancos y notas pendientes', () => {
    render(<MissingForGraduation missing={missing} />)

    expect(screen.getByText('LAB INTEGRADO DE FISICA')).toBeInTheDocument()
    expect(screen.getByText('Te falta 1 materia')).toBeInTheDocument()
    expect(screen.getByText('Te faltan 3 créditos (llevas 8 de 11)')).toBeInTheDocument()
    expect(screen.getByText('TRABAJO DE GRADO')).toBeInTheDocument()
    expect(screen.getByText(/SEMESTRE DE INDUSTRIA/)).toBeInTheDocument()
  })

  it('avisa cuando no falta nada', () => {
    render(<MissingForGraduation missing={{ mandatory: [], banks: [], pending: [] }} />)

    expect(screen.getByText(/no te falta ninguna materia/)).toBeInTheDocument()
  })

  it('avisa cuando el portal no respondió', () => {
    render(<MissingForGraduation missing={undefined} />)

    expect(screen.getByText(/No pudimos consultar/)).toBeInTheDocument()
  })
})
