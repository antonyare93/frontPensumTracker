import { useState } from 'react'

interface Props {
  onSubmit: (username: string, password: string) => void
  loading: boolean
}

export function CookieInput({ onSubmit, loading }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(username, password)
  }

  return (
    <div className="max-w-sm mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-1">Pensum Tracker</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Ingresa con tus credenciales del portal universitario.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Usuario</label>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            placeholder="tu.usuario"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Contraseña</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !username.trim() || !password.trim()}
          className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Cargando pensum...' : 'Ver mi pensum'}
        </button>
      </form>
    </div>
  )
}
