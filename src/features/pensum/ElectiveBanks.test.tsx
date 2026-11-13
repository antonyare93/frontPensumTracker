import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ElectiveBanks } from './ElectiveBanks'
import { record, subjects } from '@/test/fixtures/academic-record'

function barWidths(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>('[style]')].map(bar => bar.style.width)
}

describe('ElectiveBanks', () => {
  it('pinta la barra de cada banco con su porcentaje de avance', () => {
    const { container } = render(<ElectiveBanks banks={record.elective_banks} subjects={subjects} />)

    // 3 de 6 créditos y 2 de 2.
    expect(barWidths(container)).toEqual(['50%', '100%'])
  })

  it('deja la barra en 0 % cuando el banco no exige créditos', () => {
    const bank = { name: 'Práctica', credits_required: 0, credits_approved: 4, subject_codes: [] }
    const { container } = render(<ElectiveBanks banks={[bank]} subjects={subjects} />)

    expect(barWidths(container)).toEqual(['0%'])
  })

  it('sin cupo conocido muestra solo lo aprobado y no pinta barra', () => {
    const bank = { name: 'Sociohumanísticas', credits_required: null, credits_approved: 4, subject_codes: [] }
    const { container } = render(<ElectiveBanks banks={[bank]} subjects={subjects} />)

    expect(screen.getByText('4 créditos aprobados · mínimo no disponible')).toBeInTheDocument()
    expect(barWidths(container)).toEqual([])
  })

  it('pinta el estado de cada materia del banco con su etiqueta y sus colores', async () => {
    render(<ElectiveBanks banks={record.elective_banks} subjects={subjects} />)
    const user = userEvent.setup()
    for (const toggle of screen.getAllByRole('button', { name: 'Ver 2 materias' })) {
      await user.click(toggle)
    }

    expect(screen.getByText('Disponible')).toHaveClass('bg-amber-100', 'text-amber-800')
    expect(screen.getAllByText('Aprobada')[0]).toHaveClass('bg-green-100', 'text-green-800')
    expect(screen.getByText('No requerida')).toHaveClass('bg-gray-50', 'text-gray-400')
  })

  it('muestra una raya si una materia del banco no está en el pensum', async () => {
    const bank = { name: 'Banco', credits_required: 3, credits_approved: 0, subject_codes: ['ZZZ999'] }
    render(<ElectiveBanks banks={[bank]} subjects={subjects} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Ver 1 materias' }))

    expect(screen.getByText('ZZZ999').parentElement).toHaveTextContent('ZZZ999—')
  })

  it('avisa cuando no hay bancos', () => {
    render(<ElectiveBanks banks={[]} subjects={subjects} />)

    expect(screen.getByText('No hay bancos de electivas registrados.')).toBeInTheDocument()
  })
})
