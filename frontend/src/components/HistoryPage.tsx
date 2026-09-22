import { FormEvent, useState } from 'react'
import { fetchHistory } from '../api/candorApi'
import type { HistoryEntry } from '../api/types'
import StatusBadge from './StatusBadge'

interface Props {
  authToken: string
}

export default function HistoryPage({ authToken }: Props) {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!owner.trim() || !repo.trim()) return

    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const result = await fetchHistory(owner.trim(), repo.trim(), authToken)
      setEntries(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setEntries(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="hist-owner">Owner</label>
            <input id="hist-owner" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g. spring-projects" />
          </div>
          <div className="field">
            <label htmlFor="hist-repo">Repository</label>
            <input id="hist-repo" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="e.g. spring-boot" />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-run" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Load saved analysis'}
          </button>
          <span className="hint">Shows results already cached from a previous "Run analysis" call.</span>
        </div>
      </form>

      {error && <div className="error-banner">Error: {error}</div>}
      {loading && <div className="loading-state">Loading saved results...</div>}

      {!loading && searched && entries && entries.length === 0 && (
        <div className="empty-state">
          No saved analysis found for this repo yet. Run an analysis on the "Analyze" tab first.
        </div>
      )}

      {!loading && entries && entries.length > 0 && (
        <div className="pr-log">
          <div className="pr-row head">
            <div>PR</div>
            <div>Details</div>
            <div>Review</div>
            <div>Follow-up fix</div>
          </div>
          {entries.map((entry) => (
            <div key={entry.id} className="pr-row">
              <div className="pr-number">#{entry.prNumber}</div>
              <div className="pr-main">
                <div className="pr-title">
                  <a href={entry.url} target="_blank" rel="noreferrer">{entry.title}</a>
                </div>
                <div className="pr-meta">
                  {entry.author} · merged {new Date(entry.mergedAt).toLocaleDateString()} · last analyzed {new Date(entry.analyzedAt).toLocaleDateString()}
                </div>
              </div>
              <div><StatusBadge type={entry.reviewType} /></div>
              <div>
                {entry.hadFollowUpFix ? (
                  <span className="fix-flag yes">⚠ {entry.followUpCommitMessages.length} fix commit(s)</span>
                ) : (
                  <span className="fix-flag no">— none</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
