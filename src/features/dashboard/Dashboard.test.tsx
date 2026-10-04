import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dashboard } from './Dashboard'
import type { PartialRecord } from '@/domain/academic-record'
import { record, subjects } from '@/test/fixtures/academic-record'

function renderDashboard(data: PartialRecord, handlers: Partial<Parameters<typeof Dashboard>[0]> = {}) {
  return render(
    <Dashboard data={data} error={null} onReset={vi.fn()} onChangeVersion={vi.fn()} {...handlers} />,
  )
}

const student = { student_name: 'Ana Prueba', program_name: 'Ingeniería de Sistemas', program_code: '504' }
const program = { pensum_version: 2, version_actual: 2, enrolled_version: 2, versiones: [1, 2], total_credits: 35 }
const optionLabels = () =>
  within(screen.getByLabelText('Pensum')).getAllByRole('option').map(option => option.textContent)

describe('Dashboard', () => {
  it('avisa de los créditos cursados por encima del plan', () => {
    renderDashboard({ ...record, completed_credits: 40, progress_credits: 35 })

    expect(
      screen.getByText('Has cursado 40 créditos en total (5 adicionales al plan)'),
    ).toBeInTheDocument()
  })

  it('no cuenta como adicionales las obligatorias que todavía faltan', () => {
    renderDashboard({
      ...record,
      progress_credits: 163,
      total_credits: 168,
      completed_credits: 180,
    })

    expect(
      screen.getByText('Has cursado 180 créditos en total (17 adicionales al plan)'),
    ).toBeInTheDocument()
  })

  it('no muestra ese aviso cuando lo cursado no supera el plan', () => {
    renderDashboard({ ...record, completed_credits: 35, progress_credits: 35 })

    expect(screen.queryByText(/adicionales al plan/)).not.toBeInTheDocument()
  })

  it('avisa cuando el estudiante completó el plan', () => {
    renderDashboard({ ...record, graduated: true })

    expect(
      screen.getByText(
        'Completaste todos los créditos del plan. No tienes materias pendientes para el grado.',
      ),
    ).toBeInTheDocument()
  })

  it('muestra los créditos faltantes contando los que están en curso', () => {
    renderDashboard({
      ...record,
      total_credits: 168,
      progress_credits: 77,
      in_progress_credits: 21,
    })

    expect(screen.getByText('70 créditos faltantes')).toBeInTheDocument()
  })

  it('usa singular cuando falta un crédito', () => {
    renderDashboard({
      ...record,
      total_credits: 35,
      progress_credits: 34,
      in_progress_credits: 0,
    })

    expect(screen.getByText('1 crédito faltante')).toBeInTheDocument()
  })

  it('no muestra créditos faltantes cuando no queda ninguno', () => {
    renderDashboard({
      ...record,
      graduated: true,
      total_credits: 35,
      progress_credits: 35,
      in_progress_credits: 0,
    })

    expect(screen.getByText(/Completaste todos los créditos/)).toBeInTheDocument()
    expect(screen.queryByText(/créditos? faltantes/)).not.toBeInTheDocument()
  })
})

describe('Dashboard con el expediente a medio llegar', () => {
  it('sin datos pinta la estructura vacía: sin nombre, sin selector, sin gauge ni tablas', () => {
    renderDashboard({})

    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Pensum')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Progreso/)).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByText('Sem 1')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Pensum' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Cerrar sesión' })).toHaveLength(2)
  })

  it('con los datos del estudiante pinta nombre y programa, todavía sin selector', () => {
    renderDashboard(student)

    expect(screen.getByRole('heading', { level: 1, name: 'Ana Prueba' })).toBeInTheDocument()
    expect(screen.getByText('Ingeniería de Sistemas')).toBeInTheDocument()
    expect(screen.queryByLabelText('Pensum')).not.toBeInTheDocument()
  })

  it('con las materias pero sin el expediente pinta la malla y deja el resto cargando', () => {
    renderDashboard({ ...student, ...program, subjects })

    expect(screen.getByText('Sem 1')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Progreso/)).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('pinta en el gauge los créditos que cuentan para el grado, no los cursados en total', () => {
    renderDashboard({ ...record, progress_credits: 12, completed_credits: 20, in_progress_credits: 0 })

    expect(screen.getByLabelText('Progreso: 34% aprobado')).toBeInTheDocument()
    expect(screen.getByText('12 / 35 créditos para el grado')).toBeInTheDocument()
    expect(screen.queryByText(/en curso/)).not.toBeInTheDocument()
  })

})

describe('Dashboard: selector de versión', () => {
  it('no aparece si el programa tiene una sola versión', () => {
    renderDashboard({ ...student, ...program, versiones: [2] })

    expect(screen.queryByLabelText('Pensum')).not.toBeInTheDocument()
  })

  it('no aparece mientras falte la versión actual del pensum', () => {
    renderDashboard({ ...student, versiones: [1, 2] })

    expect(screen.queryByLabelText('Pensum')).not.toBeInTheDocument()
  })

  it('marca la versión del estudiante y la vigente', () => {
    renderDashboard({ ...student, ...program, pensum_version: 1, enrolled_version: 1, version_actual: 2 })

    expect(screen.getByLabelText('Pensum')).toHaveValue('1')
    expect(optionLabels()).toEqual(['V1 (tuya)', 'V2 (vigente)'])
    expect(screen.queryByText(/Tu versión/)).not.toBeInTheDocument()
  })

  it('no marca ninguna como tuya si el estudiante no tiene versión asignada', () => {
    renderDashboard({ ...student, ...program, enrolled_version: null })

    expect(optionLabels()).toEqual(['V1', 'V2 (vigente)'])
    expect(screen.queryByText(/Tu versión/)).not.toBeInTheDocument()
  })

  it('tampoco marca ninguna como tuya si ese dato todavía no llegó', () => {
    renderDashboard({ ...student, pensum_version: 2, version_actual: 2, versiones: [1, 2] })

    expect(optionLabels()).toEqual(['V1', 'V2 (vigente)'])
    expect(screen.queryByText(/Tu versión/)).not.toBeInTheDocument()
  })

  it('recuerda la versión del estudiante cuando explora otra', () => {
    renderDashboard({ ...student, ...program, pensum_version: 2, enrolled_version: 1 })
    const hint = screen.getByText(/Tu versión/)

    expect(hint).toHaveTextContent('Tu versión: V1')
    expect(screen.getByLabelText('Pensum')).toHaveAttribute('aria-describedby', hint.id)
  })

  it('se bloquea y avisa mientras llega la otra versión', async () => {
    let finish = () => {}
    const onChangeVersion = vi.fn(() => new Promise<void>(resolve => (finish = resolve)))
    renderDashboard({ ...student, ...program }, { onChangeVersion })

    await userEvent.setup().selectOptions(screen.getByLabelText('Pensum'), '1')

    expect(onChangeVersion).toHaveBeenCalledWith(1)
    expect(screen.getByLabelText('Pensum')).toBeDisabled()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()

    await act(async () => finish())

    expect(screen.getByLabelText('Pensum')).toBeEnabled()
    expect(screen.queryByText('Cargando...')).not.toBeInTheDocument()
  })
})

describe('Dashboard: cerrar sesión', () => {
  it('los dos botones de salir, el de móvil y el de escritorio, avisan', async () => {
    const onReset = vi.fn()
    const user = userEvent.setup()
    renderDashboard(record, { onReset })

    for (const button of screen.getAllByRole('button', { name: 'Cerrar sesión' })) {
      await user.click(button)
    }

    expect(onReset).toHaveBeenCalledTimes(2)
  })
})
