import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import App from './App'
import type { StreamEvent } from '@/types/stream'
import { ndjsonResponse } from '@/test/stream'
import { recordEvents } from '@/test/fixtures/academic-record'

function mockFetch(respond: () => Response) {
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    async () => respond(),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function passwordInput() {
  return document.querySelector<HTMLInputElement>('input[autocomplete="current-password"]')!
}

async function login(user: UserEvent) {
  await user.type(screen.getByPlaceholderText('tu.usuario'), 'ana.prueba')
  await user.type(passwordInput(), 'Secreta123')
  await user.click(screen.getByRole('button', { name: 'Ver mi pensum' }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('muestra el login al abrir', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Cursum Pro' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver mi pensum' })).toBeDisabled()
  })

  it('envía las credenciales al endpoint de streaming', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetch(() => ndjsonResponse(recordEvents))
    render(<App />)

    await login(user)
    await screen.findByLabelText('Progreso: 34% aprobado')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/api\/login\/stream$/)
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({
      username: 'ana.prueba',
      password: 'Secreta123',
      pensum_version: 0,
    })
  })

  it('pinta el dashboard completo con el expediente recibido', async () => {
    const user = userEvent.setup()
    mockFetch(() => ndjsonResponse(recordEvents))
    render(<App />)

    await login(user)
    await screen.findByLabelText('Progreso: 34% aprobado')

    expect(screen.getByRole('heading', { level: 1, name: 'Ana Prueba' })).toBeInTheDocument()
    expect(screen.getByText('Ingeniería de Sistemas')).toBeInTheDocument()
    expect(screen.getByText('12 / 35 créditos para el grado')).toBeInTheDocument()
    expect(screen.getByText('· 4 en curso')).toBeInTheDocument()

    // Malla: a ancho móvil se ven dos semestres de cuatro.
    expect(screen.getByText('1–2 de 4')).toBeInTheDocument()
    expect(screen.getByText('Sem 1')).toBeInTheDocument()
    expect(screen.getByText('Sem 2')).toBeInTheDocument()
    expect(screen.queryByText('Sem 3')).not.toBeInTheDocument()

    // Materias disponibles: por semestre (la electiva va en 0) y luego por nombre.
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(rows.map(row => within(row).getAllByRole('cell')[1].textContent)).toEqual([
      'ELE001',
      'PRG201',
      'PRG301',
      'MAT301',
    ])

    // Materia en curso de la calculadora de notas y bancos de electivas, en el
    // orden que los entrega el backend.
    expect(
      screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent),
    ).toEqual(['Cálculo II', 'Electivas profesionales', 'Formación complementaria'])
    expect(screen.getByText('3 / 6 créditos')).toBeInTheDocument()
    expect(screen.getByText('2 / 2 créditos')).toBeInTheDocument()
  })

  it('despliega las materias de un banco con su estado', async () => {
    const user = userEvent.setup()
    mockFetch(() => ndjsonResponse(recordEvents))
    render(<App />)
    await login(user)
    await screen.findByLabelText('Progreso: 34% aprobado')

    await user.click(screen.getAllByRole('button', { name: 'Ver 2 materias' })[1])

    const items = within(screen.getAllByRole('list').at(-1)!).getAllByRole('listitem')
    expect(items.map(item => item.textContent)).toEqual([
      'ELE003FotografíaAprobada',
      'ELE004AjedrezNo requerida',
    ])
    expect(screen.getByRole('button', { name: 'Ocultar materias' })).toBeInTheDocument()
  })

  it('vuelve a pedir el expediente al cambiar la versión del pensum', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetch(() => ndjsonResponse(recordEvents))
    render(<App />)
    await login(user)
    await screen.findByLabelText('Progreso: 34% aprobado')
    const select = screen.getByLabelText('Pensum')
    expect(within(select).getAllByRole('option').map(option => option.textContent)).toEqual([
      'V1',
      'V2 (tuya, vigente)',
    ])

    await user.selectOptions(select, '1')

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      username: 'ana.prueba',
      password: 'Secreta123',
      pensum_version: 1,
    })
    // El dashboard se queda en pantalla mientras llega la otra versión.
    expect(screen.getByRole('heading', { level: 1, name: 'Ana Prueba' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByLabelText('Pensum')).toBeEnabled())
  })

  it('lee el expediente aunque llegue byte a byte, con tildes partidas entre chunks', async () => {
    const user = userEvent.setup()
    mockFetch(() => ndjsonResponse(recordEvents, 1))
    render(<App />)

    await login(user)

    expect(await screen.findByLabelText('Progreso: 34% aprobado')).toBeInTheDocument()
    expect(screen.getByText('Ingeniería de Sistemas')).toBeInTheDocument()
    // En el pensum y en la calculadora de notas, porque está en curso.
    expect(screen.getAllByText('Cálculo II')).toHaveLength(2)
  })

  it('vuelve al login al cerrar sesión', async () => {
    const user = userEvent.setup()
    mockFetch(() => ndjsonResponse(recordEvents))
    render(<App />)

    await login(user)
    await screen.findByLabelText('Progreso: 34% aprobado')
    await user.click(screen.getAllByRole('button', { name: 'Cerrar sesión' })[0])

    expect(screen.getByRole('heading', { level: 1, name: 'Cursum Pro' })).toBeInTheDocument()
    expect(screen.queryByText('Ana Prueba')).not.toBeInTheDocument()
  })

  it('muestra el detalle del backend cuando rechaza las credenciales', async () => {
    const user = userEvent.setup()
    mockFetch(
      () =>
        new Response(JSON.stringify({ detail: 'Credenciales inválidas o sesión no establecida' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
    )
    render(<App />)

    await login(user)

    expect(
      await screen.findByText('Credenciales inválidas o sesión no establecida'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver mi pensum' })).toBeEnabled()
  })

  it('muestra un mensaje genérico si el error llega sin cuerpo JSON', async () => {
    const user = userEvent.setup()
    mockFetch(() => new Response('Bad Gateway', { status: 502 }))
    render(<App />)

    await login(user)

    expect(await screen.findByText('Error al iniciar sesión')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver mi pensum' })).toBeEnabled()
  })

  it('conserva el dashboard si el error llega con datos parciales', async () => {
    const user = userEvent.setup()
    const events: StreamEvent[] = [
      recordEvents[0],
      { stage: 'error', status: 502, detail: 'El portal no respondió' },
    ]
    mockFetch(() => ndjsonResponse(events))
    render(<App />)

    await login(user)

    expect(await screen.findByText('El portal no respondió')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Ana Prueba' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ver mi pensum' })).not.toBeInTheDocument()
  })
})
