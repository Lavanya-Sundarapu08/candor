import { useState } from 'react'
import { KeyRound, ArrowRight } from 'lucide-react'

interface Props {
  token: string
  onSave: (token: string) => void
}

export default function GitHubPatPage({ token, onSave }: Props) {
  const [value, setValue] = useState(token)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave(value.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-header">
      <h1>GitHub Authentication</h1>
      <p className="page-subtitle">
        Set a GitHub personal access token to raise the API rate limit from 60 to 5,000 requests/hour.
        Used only for outgoing requests and kept in your browser — never sent anywhere except GitHub's API.
      </p>

      <div className="pat-card">
        <div className="pat-card-header">
          <div className="pat-icon"><KeyRound size={20} /></div>
          <div>
            <div className="pat-title">Personal Access Token (PAT)</div>
            <div className="pat-hint">Stored in this browser only, used only for GitHub REST API calls.</div>
          </div>
        </div>

        <label className="pat-label" htmlFor="pat-input">Personal access token</label>
        <input
          id="pat-input"
          className="pat-input"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        />

        <div className="pat-permissions">
          <div className="pat-permissions-title">Recommended token scope</div>
          <ul>
            <li><code>public_repo</code> — sufficient for public open-source repos</li>
            <li><code>repo</code> — needed for private repositories</li>
          </ul>
        </div>

        <button className="btn-run pat-save-btn" onClick={handleSave}>
          {saved ? 'Saved' : 'Save GitHub Token'} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
