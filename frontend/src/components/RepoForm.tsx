import { FormEvent, useState } from 'react'

interface Props {
  onSubmit: (owner: string, repo: string, token: string, limit: number) => void
  loading: boolean
}

export default function RepoForm({ onSubmit, loading }: Props) {
  const [owner, setOwner] = useState('spring-projects')
  const [repo, setRepo] = useState('spring-boot')
  const [token, setToken] = useState('')
  const [limit, setLimit] = useState(10)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!owner.trim() || !repo.trim()) return
    onSubmit(owner.trim(), repo.trim(), token.trim(), limit)
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="field">
          <label htmlFor="owner">Owner</label>
          <input id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g. spring-projects" />
        </div>
        <div className="field">
          <label htmlFor="repo">Repository</label>
          <input id="repo" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="e.g. spring-boot" />
        </div>
        <div className="field" style={{ flexBasis: 100 }}>
          <label htmlFor="limit">PRs to scan</label>
          <input id="limit" type="number" min={1} max={30} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
        </div>
        <div className="field field-token">
          <label htmlFor="token">GitHub token (optional)</label>
          <input id="token" type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="raises the 60 req/hr limit" />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-run" type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Run analysis'}
        </button>
        <span className="hint">Scans the most recently updated merged PRs first.</span>
      </div>
    </form>
  )
}
