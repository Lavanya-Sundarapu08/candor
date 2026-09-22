import { useState } from 'react'
import { ShieldAlert, Send } from 'lucide-react'
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
  const [activeAlertPr, setActiveAlertPr] = useState<PullRequestAnalysis | null>(null)

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
                <div>
                  <button className="btn-alert-slack" onClick={() => setActiveAlertPr(pr)}>
                    <Send size={12} /> Dispatch Slack / Webhook Alert
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeAlertPr && (
        <div className="slack-modal-overlay" onClick={() => setActiveAlertPr(null)}>
          <div className="slack-modal" onClick={(e) => e.stopPropagation()}>
            <div className="slack-modal-header">
              <div className="slack-modal-title">
                <Send size={15} /> Webhook Dispatch Simulator
              </div>
              <span className="slack-status-badge">HTTP 200 OK</span>
            </div>
            <div className="slack-preview-bubble">
              <div className="slack-channel-tag">#engineering-quality-alerts &bull; incoming-webhook</div>
              <strong>🚨 High-Risk Code Review Alert: PR #{activeAlertPr.prNumber}</strong>
              <p style={{ margin: '6px 0', fontWeight: 500 }}>{activeAlertPr.title}</p>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Author: <strong>{activeAlertPr.author}</strong> &bull; Review Substance: <strong>{activeAlertPr.reviewType}</strong>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', background: '#ffffff', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                ⚠️ <strong>{activeAlertPr.followUpFixes.length} related follow-up bug fix(es)</strong> detected on overlapping modified files within 14 days of merge.
              </div>
            </div>
            <div className="slack-modal-footer">
              <button className="btn-run" onClick={() => setActiveAlertPr(null)}>Close Simulation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
