import type { AnalysisSummary } from '../api/types'

interface Props {
  summary: AnalysisSummary
}

export default function SummaryCards({ summary }: Props) {
  return (
    <div className="summary-grid">
      <div className="stat-card">
        <div className="stat-label">PRs analyzed</div>
        <div className="stat-value">{summary.totalAnalyzed}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Review coverage</div>
        <div className="stat-value">{summary.reviewedCount} / {summary.totalAnalyzed} reviewed</div>
        {summary.reviewedCount === 0 ? (
          <div className="stat-sublabel">No review comments available</div>
        ) : (
          <div className="diffstat">
            <span className="plus">+{summary.substantiveCount} substantive</span>
            <br />
            <span className="minus">-{summary.superficialCount} superficial</span>
          </div>
        )}
      </div>

      <div className="stat-card">
        <div className="stat-label">Superficial rate</div>
        {summary.superficialRatePercent === null ? (
          <>
            <div className="stat-value muted">N/A</div>
            <div className="stat-sublabel">No review comments</div>
          </>
        ) : (
          <div className="stat-value del">{summary.superficialRatePercent.toFixed(0)}%</div>
        )}
      </div>

      <div className="stat-card">
        <div className="stat-label">PRs with follow-up fix activity</div>
        <div className="stat-value warn">
          {summary.followUpFixCount}
          <span className="stat-value-sub"> ({summary.followUpFixRatePercent.toFixed(0)}%)</span>
        </div>
        <div className="stat-sublabel">related follow-up fixes detected</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Superficial review + follow-up fix</div>
        <div className="stat-value del">{summary.riskyApprovalCount}</div>
        <div className="stat-sublabel">the specific pattern Candor is built to surface</div>
      </div>
    </div>
  )
}
