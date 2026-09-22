import { FormEvent, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { login, register } from '../api/candorApi'

interface Props {
  onAuthenticated: (token: string, username: string) => void
}

export default function AuthPage({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = mode === 'login'
        ? await login(username.trim(), password)
        : await register(username.trim(), email.trim(), password)
      onAuthenticated(result.token, result.username)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-avatar">C</div>
          <div>
            <div className="brand-name">CANDOR <span className="brand-version">v2.0</span></div>
            <div className="brand-subtitle">CODE QUALITY &amp; RISK</div>
          </div>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="pat-label">Username</label>
          <input className="pat-input" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />

          {mode === 'register' && (
            <>
              <label className="pat-label">Email</label>
              <input className="pat-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </>
          )}

          <label className="pat-label">Password</label>
          <input className="pat-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />

          {error && <div className="error-banner">{error}</div>}

          <button className="btn-run pat-save-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <div className="auth-footnote">
          <ShieldCheck size={13} /> Your Candor account is separate from your GitHub token, set later in "GitHub PAT Setup".
        </div>
      </div>
    </div>
  )
}
