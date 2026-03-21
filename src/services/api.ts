import type { AcademicRecord } from '@/types/academic'

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api`

export async function loginAndFetch(
  username: string,
  password: string,
  pensumVersion: number,
): Promise<AcademicRecord> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, pensum_version: pensumVersion }),
  })
  if (!res.ok) {
    const err = await res.json() as { detail: string }
    throw new Error(err.detail ?? 'Error al iniciar sesión')
  }
  return res.json() as Promise<AcademicRecord>
}
