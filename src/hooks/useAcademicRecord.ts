import { useState, useRef, useCallback } from 'react'
import type { AcademicRecord } from '@/types/academic'
import { streamLoginAndFetch, type StreamEvent } from '@/services/api'

type Status = 'idle' | 'loading' | 'error'

export type PartialRecord = Partial<AcademicRecord>

function mergeStage(prev: PartialRecord | null, event: StreamEvent): PartialRecord {
  const base = prev ?? {}
  switch (event.stage) {
    case 'student_info':
    case 'program_info':
    case 'record':
      return { ...base, ...event.data }
    case 'pensum':
      if (base.completed_credits !== undefined) return base
      return { ...base, subjects: event.data.subjects }
    default:
      return base
  }
}

export function useAcademicRecord() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<PartialRecord | null>(null)
  const credsRef = useRef<{ username: string; password: string } | null>(null)

  const run = useCallback(
    async (username: string, password: string, pensumVersion: number, keepData: boolean) => {
      credsRef.current = { username, password }
      setStatus('loading')
      setError(null)
      if (!keepData) setData(null)

      try {
        await streamLoginAndFetch(username, password, pensumVersion, event => {
          if (event.stage === 'error') {
            setError(event.detail)
            setStatus('error')
            return
          }
          setData(prev => mergeStage(prev, event))
        })
        setStatus(prev => (prev === 'error' ? prev : 'idle'))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setStatus('error')
      }
    },
    [],
  )

  const load = useCallback(
    (username: string, password: string, pensumVersion = 0) =>
      run(username, password, pensumVersion, false),
    [run],
  )

  const changeVersion = useCallback(
    async (version: number) => {
      if (!credsRef.current) return
      await run(credsRef.current.username, credsRef.current.password, version, true)
    },
    [run],
  )

  const reset = useCallback(() => {
    credsRef.current = null
    setData(null)
    setError(null)
    setStatus('idle')
  }, [])

  return { status, error, data, load, reset, changeVersion }
}
