import { useAcademicRecord } from '@/hooks/useAcademicRecord'
import { CookieInput } from '@/components/CookieInput'
import { Dashboard } from '@/components/Dashboard'

export default function App() {
  const { status, error, data, load, reset, changeVersion } = useAcademicRecord()

  if (data) {
    return (
      <Dashboard
        data={data}
        error={status === 'error' ? error : null}
        onReset={reset}
        onChangeVersion={changeVersion}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full">
        <CookieInput
          onSubmit={load}
          loading={status === 'loading'}
        />
        {status === 'error' && error ? (
          <p className="text-destructive text-sm text-center mt-2">{error}</p>
        ) : null}
      </div>
    </div>
  )
}
