import { useAcademicRecord } from '@/hooks/useAcademicRecord'
import { CookieInput } from '@/components/CookieInput'
import { Dashboard } from '@/components/Dashboard'

export default function App() {
  const { state, record, load, reset, changeVersion } = useAcademicRecord()

  if (record) {
    return <Dashboard record={record} onReset={reset} onChangeVersion={changeVersion} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full">
        <CookieInput
          onSubmit={load}
          loading={state.status === 'loading'}
        />
        {state.status === 'error' ? (
          <p className="text-destructive text-sm text-center mt-2">{state.message}</p>
        ) : null}
      </div>
    </div>
  )
}
