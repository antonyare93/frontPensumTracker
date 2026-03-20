import { useState, useRef } from 'react'
import type { AcademicRecord } from '@/types/academic'
import { loginAndFetch } from '@/services/api'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }

export function useAcademicRecord() {
  const [state, setState] = useState<State>({ status: 'idle' })
  const [record, setRecord] = useState<AcademicRecord | null>(null)
  const credsRef = useRef<{ username: string; password: string } | null>(null)

  async function load(username: string, password: string, pensumVersion = 0) {
    credsRef.current = { username, password }
    setState({ status: 'loading' })
    try {
      const newRecord = await loginAndFetch(username, password, pensumVersion)
      setRecord(newRecord)
      setState({ status: 'idle' })
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Error desconocido' })
    }
  }

  async function changeVersion(version: number) {
    if (!credsRef.current) return
    await load(credsRef.current.username, credsRef.current.password, version)
  }

  function reset() {
    credsRef.current = null
    setRecord(null)
    setState({ status: 'idle' })
  }

  return { state, record, load, reset, changeVersion }
}
