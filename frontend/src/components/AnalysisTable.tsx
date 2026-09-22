import { useState } from 'react'
import type { PullRequestAnalysis } from '../api/types'
import StatusBadge from './StatusBadge'
import PRDetailPanel from './PRDetailPanel'

interface Props {
  pullRequests: PullRequestAnalysis[]
  authToken: string
}

export default function AnalysisTable({ pullRequests, authToken }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null)

  if (pullRequests.length === 0) {
    return <div className="empty-state">No merged pull requests found for this repository.</div>
  }

  return (
    <div className="pr-log">
      <div className="pr-row head">
        <div>PR</div>
        <div>Details</div>
        <div>Review</div>
        <div>Follow-up fix</div>
      </div>

      {pullRequests.map((pr) => {
        const isOpen = expanded === pr.prNumber
        return (
          <div key={pr.prNumber} className="pr-row-wrapper">
            <button className="pr-row pr-row-button" onClick={() => setExpanded(isOpen ? null : pr.prNumber)} aria-expanded={isOpen}>
              <div className="pr-number">
                <span className="expand-caret">{isOpen ? '▾' : '▸'}</span> #{pr.prNumber}
              </div>
              <div className="pr-main">
                <div className="pr-title">{pr.title}</div>
                <div className="pr-meta">
                  {pr.author} · merged {new Date(pr.mergedAt).toLocaleDateString()} · {pr.filesChanged.length} file(s)
                </div>
                <div className="pr-snippet">"{pr.reviewSnippet}"</div>
              </div>
              <div><StatusBadge type={pr.reviewType} /></div>
              <div>
                {pr.hadFollowUpFix ? (
                  <span className="fix-flag yes">
                    ⚠ {pr.followUpFixes.length} related follow-up {pr.followUpFixes.length === 1 ? 'fix' : 'fixes'}
                  </span>
                ) : (
                  <span className="fix-flag no">— none detected</span>
                )}
              </div>
            </button>
            {isOpen && <PRDetailPanel pr={pr} authToken={authToken} />}
          </div>
        )
      })}
    </div>
  )
}
