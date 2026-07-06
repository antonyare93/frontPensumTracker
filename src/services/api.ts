import type { AcademicRecord, Subject } from '@/types/academic'

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api`

interface StudentInfoData {
  student_name: string
  program_name: string
  program_code: string
}

interface ProgramInfoData {
  pensum_version: number
  version_actual: number
  versiones: number[]
  total_credits: number
}

export type StreamEvent =
  | { stage: 'student_info'; data: StudentInfoData }
  | { stage: 'program_info'; data: ProgramInfoData }
  | { stage: 'pensum'; data: { subjects: Subject[] } }
  | { stage: 'record'; data: AcademicRecord }
  | { stage: 'error'; status: number; detail: string }

export async function streamLoginAndFetch(
  username: string,
  password: string,
  pensumVersion: number,
  onEvent: (event: StreamEvent) => void,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/login/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, pensum_version: pensumVersion }),
  })

  if (!res.ok || !res.body) {
    const err = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new Error(err?.detail ?? 'Error al iniciar sesión')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let newlineIndex: number
    while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newlineIndex).trim()
      buffer = buffer.slice(newlineIndex + 1)
      if (line) onEvent(JSON.parse(line) as StreamEvent)
    }
  }

  const tail = buffer.trim()
  if (tail) onEvent(JSON.parse(tail) as StreamEvent)
}
