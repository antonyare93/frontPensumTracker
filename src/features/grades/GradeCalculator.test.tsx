import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Subject } from '@/types/academic'
import { GradeCalculator } from './GradeCalculator'

const calculo: Subject = {
  code: 'MAT101',
  name: 'Cálculo I',
  credits: 4,
  semester: 1,
  obligatoria: true,
  elective_bank: null,
  prerequisites: [],
  corequisites: [],
  cursada: false,
  nota: null,
  cursando: true,
  status: 'in_progress',
}

describe('GradeCalculator', () => {
  it('avisa cuando no hay materias en curso', () => {
    render(<GradeCalculator subjects={[{ ...calculo, cursando: false, status: 'available' }]} />)

    expect(screen.getByText(/No tienes materias matriculadas/)).toBeInTheDocument()
  })

  it('calcula la nota necesaria a medida que el estudiante escribe', async () => {
    render(<GradeCalculator subjects={[calculo]} />)
    const user = userEvent.setup()

    expect(screen.getByText('Cálculo I')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Nota 1 de Cálculo I'), '4')
    await user.type(screen.getByLabelText('Porcentaje 1 de Cálculo I'), '50')

    expect(screen.getByText('Acumulado: 2,00 de 50 % evaluado')).toBeInTheDocument()
    expect(screen.getByText('Necesitas 2,00 en el 50 % restante')).toBeInTheDocument()
  })

  it('agrega y quita evaluaciones', async () => {
    render(<GradeCalculator subjects={[calculo]} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Agregar evaluación a Cálculo I' }))
    expect(screen.getByLabelText('Nota 2 de Cálculo I')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Quitar evaluación 2 de Cálculo I' }))
    expect(screen.queryByLabelText('Nota 2 de Cálculo I')).not.toBeInTheDocument()
  })

  it('avisa cuando los porcentajes pasan de 100', async () => {
    render(<GradeCalculator subjects={[calculo]} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nota 1 de Cálculo I'), '4')
    await user.type(screen.getByLabelText('Porcentaje 1 de Cálculo I'), '120')

    expect(screen.getByText('Los porcentajes suman más de 100 %')).toBeInTheDocument()
  })
})
