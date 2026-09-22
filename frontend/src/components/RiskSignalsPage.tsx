import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import type { PullRequestAnalysis } from '../api/types'
import StatusBadge from './StatusBadge'

type Severity = 'HIGH' | 'MEDIUM' | 'LOW'

function severityOf(pr: PullRequestAnalysis): Severity {
  if (pr.reviewType === 'SUPERFICIAL') return 'HIGH'
  if (pr.reviewType === 'SUBSTANTIVE') return 'MEDIUM'
  return 'LOW'
}

const SEVERITY_HINT: Record<Severity, string> = {
  HIGH: 'Superficial review + follow-up fix',
  MEDIUM: 'Substantive review + follow-up fix (still worth a glance)',
  LOW: 'No review + follow-up fix (can\'t attribute to review quality)'
}

interface Props {
  pullRequests: PullRequestAnalysis[]
}

export default function RiskSignalsPage({ pullRequests }: Props) {
  const [filter, setFilter] = useState<'ALL' | Severity>('ALL')

  const flagged = pullRequests.filter((pr) => pr.hadFollowUpFix)
  const shown = filter === 'ALL' ? flagged : flagged.filter((pr) => severityOf(pr) === filter)

  return (
    <div className="page-header">
      <h1>Detected Risk Signals</h1>
      <p className="page-subtitle">
        PRs whose changed files showed follow-up fix activity within the review window. A signal
        worth a second look — not proof the review failed.
      </p>

      <div className="filter-row">
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((f) => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty-panel">
          <ShieldAlert size={22} className="empty-panel-icon" />
          <p>No risk signals matching this filter.</p>
          <p className="empty-panel-sub">
            {flagged.length === 0
              ? 'Either all reviews are thorough, or no post-merge fixes touched overlapping files.'
              : 'Try a different severity filter.'}
          </p>
        </div>
      ) : (
        <div className="risk-signal-list">
          {shown.map((pr) => {
            const sev = severityOf(pr)
            return (
              <div className="risk-signal-card" key={pr.prNumber}>
                <div className="risk-signal-top">
                  <span className={`severity-badge ${sev.toLowerCase()}`}>{sev}</span>
                  <StatusBadge type={pr.reviewType} />
                </div>
                <div className="risk-signal-title">#{pr.prNumber} — {pr.title}</div>
                <div className="risk-signal-meta">{SEVERITY_HINT[sev]}</div>
                <div className="risk-signal-facts">
                  {pr.followUpFixes.length} related follow-up {pr.followUpFixes.length === 1 ? 'fix' : 'fixes'} ·{' '}
                  first {pr.followUpFixes[0]?.timeAfterMerge}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
