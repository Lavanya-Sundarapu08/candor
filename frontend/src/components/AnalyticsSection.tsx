import type { AnalysisSummary, PullRequestAnalysis, ReviewType } from '../api/types'
import StatusBadge from './StatusBadge'

interface Props {
  summary: AnalysisSummary
  pullRequests: PullRequestAnalysis[]
}

function monthKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

function hoursBetween(fromISO: string, toISO: string | null): number | null {
  if (!toISO) return null
  const from = new Date(fromISO).getTime()
  const to = new Date(toISO).getTime()
  if (Number.isNaN(from) || Number.isNaN(to)) return null
  return (to - from) / (1000 * 60 * 60)
}

function formatHours(hours: number): string {
  if (hours < 1) return '<1h'
  if (hours < 24) return `${hours.toFixed(0)}h`
  return `${(hours / 24).toFixed(1)}d`
}

const REVIEW_STATE_LABEL: Record<ReviewType, string> = {
  SUBSTANTIVE: 'Substantive',
  SUPERFICIAL: 'Superficial',
  NONE: 'No review'
}

export default function AnalyticsSection({ summary, pullRequests }: Props) {
  if (pullRequests.length === 0) return null

  const coverageByMonth = new Map<string, { label: string; total: number; reviewed: number }>()
  for (const pr of pullRequests) {
    const key = monthKey(pr.mergedAt)
    if (!coverageByMonth.has(key)) {
      coverageByMonth.set(key, { label: monthLabel(pr.mergedAt), total: 0, reviewed: 0 })
    }
    const bucket = coverageByMonth.get(key)!
    bucket.total += 1
    if (pr.reviewType !== 'NONE') bucket.reviewed += 1
  }
  const coverageRows = Array.from(coverageByMonth.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)

  const reviewedCount = summary.reviewedCount
  const substantivePct = reviewedCount === 0 ? 0 : (summary.substantiveCount / reviewedCount) * 100
  const superficialPct = reviewedCount === 0 ? 0 : (summary.superficialCount / reviewedCount) * 100

  const stateOrder: ReviewType[] = ['SUBSTANTIVE', 'SUPERFICIAL', 'NONE']
  const followUpByState = stateOrder
    .map((state) => {
      const inState = pullRequests.filter((pr) => pr.reviewType === state)
      const withFollowUp = inState.filter((pr) => pr.hadFollowUpFix)
      return { state, count: inState.length, followUpCount: withFollowUp.length }
    })
    .filter((row) => row.count > 0)

  const firstFollowUpHours: number[] = []
  for (const pr of pullRequests) {
    if (pr.followUpFixes.length === 0) continue
    const deltas = pr.followUpFixes.map((f) => hoursBetween(pr.mergedAt, f.commitDate)).filter((h): h is number => h !== null)
    if (deltas.length > 0) firstFollowUpHours.push(Math.min(...deltas))
  }
  firstFollowUpHours.sort((a, b) => a - b)
  const median =
    firstFollowUpHours.length === 0
      ? null
      : firstFollowUpHours.length % 2 === 1
        ? firstFollowUpHours[(firstFollowUpHours.length - 1) / 2]
        : (firstFollowUpHours[firstFollowUpHours.length / 2 - 1] + firstFollowUpHours[firstFollowUpHours.length / 2]) / 2

  const fileCounts = new Map<string, number>()
  for (const pr of pullRequests) {
    for (const fix of pr.followUpFixes) {
      fileCounts.set(fix.file, (fileCounts.get(fix.file) ?? 0) + 1)
    }
  }
  const repeatedFiles = Array.from(fileCounts.entries()).filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const topSignals = pullRequests
    .filter((pr) => pr.followUpFixes.length > 0)
    .map((pr) => {
      const overlappingFiles = new Set(pr.followUpFixes.map((f) => f.file)).size
      const deltas = pr.followUpFixes.map((f) => hoursBetween(pr.mergedAt, f.commitDate)).filter((h): h is number => h !== null)
      const firstHours = deltas.length > 0 ? Math.min(...deltas) : null
      const firstLabel = pr.followUpFixes.find((f) => hoursBetween(pr.mergedAt, f.commitDate) === firstHours)?.timeAfterMerge ?? pr.followUpFixes[0].timeAfterMerge
      return { pr, count: pr.followUpFixes.length, overlappingFiles, firstHours, firstLabel }
    })
    .sort((a, b) => b.count - a.count || (a.firstHours ?? Infinity) - (b.firstHours ?? Infinity))
    .slice(0, 3)

  const anyFollowUp = summary.followUpFixCount > 0

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <h2>Analytics / Patterns</h2>
        <p className="analytics-disclaimer">
          Analytics describe patterns in the analyzed sample. Follow-up activity is a signal for
          investigation, not proof of review failure or causation.
        </p>
      </div>

      <div className="analytics-card">
        <h3>Review coverage over time</h3>
        {coverageRows.length === 0 ? (
          <p className="analytics-empty">Not enough historical data for a meaningful trend.</p>
        ) : (
          <div className="analytics-table">
            <div className="analytics-row head">
              <div>Month</div><div>Total</div><div>Reviewed</div><div>Unreviewed</div><div>Coverage</div>
            </div>
            {coverageRows.map((row) => (
              <div className="analytics-row" key={row.label}>
                <div>{row.label}</div>
                <div>{row.total}</div>
                <div>{row.reviewed}</div>
                <div>{row.total - row.reviewed}</div>
                <div>{((row.reviewed / row.total) * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="analytics-card">
        <h3>Review composition</h3>
        {reviewedCount === 0 ? (
          <p className="analytics-empty">Not enough review data.</p>
        ) : (
          <>
            <div className="composition-bar">
              <div className="composition-segment add" style={{ width: `${substantivePct}%` }} />
              <div className="composition-segment del" style={{ width: `${superficialPct}%` }} />
            </div>
            <div className="composition-legend">
              <span className="plus">{summary.substantiveCount} substantive ({substantivePct.toFixed(0)}%)</span>
              <span className="minus">{summary.superficialCount} superficial ({superficialPct.toFixed(0)}%)</span>
            </div>
          </>
        )}
      </div>

      <div className="analytics-card">
        <h3>Follow-up fix rate by review state</h3>
        {followUpByState.length === 0 ? (
          <p className="analytics-empty">Not enough review data.</p>
        ) : (
          <>
            <div className="analytics-table">
              <div className="analytics-row head"><div>Review state</div><div>Follow-up rate</div></div>
              {followUpByState.map((row) => (
                <div className="analytics-row" key={row.state}>
                  <div>{REVIEW_STATE_LABEL[row.state]}</div>
                  <div>{row.followUpCount} / {row.count} <span className="stat-value-sub">({((row.followUpCount / row.count) * 100).toFixed(0)}%)</span></div>
                </div>
              ))}
            </div>
            <p className="analytics-caveat">
              This describes an observed association in the analyzed sample. It does not establish
              that review quality caused or prevented follow-up fixes.
            </p>
          </>
        )}
      </div>

      <div className="analytics-card">
        <h3>Time to first follow-up fix</h3>
        {firstFollowUpHours.length === 0 ? (
          <p className="analytics-empty">No follow-up activity available.</p>
        ) : (
          <div className="time-stats">
            <div><span className="stat-label">Median</span><span className="stat-value-inline">{formatHours(median!)}</span></div>
            <div><span className="stat-label">Fastest</span><span className="stat-value-inline">{formatHours(firstFollowUpHours[0])}</span></div>
            <div><span className="stat-label">Slowest</span><span className="stat-value-inline">{formatHours(firstFollowUpHours[firstFollowUpHours.length - 1])}</span></div>
          </div>
        )}
      </div>

      <div className="analytics-card">
        <h3>Files with repeated follow-up signals</h3>
        <p className="analytics-note">Files repeatedly appearing in post-merge related changes.</p>
        {repeatedFiles.length === 0 ? (
          <p className="analytics-empty">
            {anyFollowUp ? 'No single file appeared in more than one follow-up signal.' : 'No follow-up activity detected.'}
          </p>
        ) : (
          <div className="file-list">
            {repeatedFiles.map(([file, count]) => (
              <div className="file-row" key={file}><code>{file}</code><span className="file-count">{count}</span></div>
            ))}
          </div>
        )}
      </div>

      <div className="analytics-card">
        <h3>Top follow-up signals</h3>
        <p className="signal-section-tagline">Would you trust this approval?</p>
        {topSignals.length === 0 ? (
          <p className="analytics-empty">No follow-up activity detected.</p>
        ) : (
          <div className="signal-list">
            {topSignals.map(({ pr, firstLabel }) => (
              <div className="signal-eval-card" key={pr.prNumber}>
                <div className="signal-eval-title">PR #{pr.prNumber} — {pr.title}</div>

                <div className="signal-eval-block">
                  <h5>Observed facts</h5>
                  <ul>
                    <li>Review: "{pr.reviewSnippet}"</li>
                    <li>Files changed: {pr.filesChanged.slice(0, 3).join(', ')}{pr.filesChanged.length > 3 ? ` +${pr.filesChanged.length - 3} more` : ''}</li>
                    <li>Merged: {new Date(pr.mergedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</li>
                  </ul>
                </div>

                <div className="signal-eval-block">
                  <h5>Classification</h5>
                  <div className="signal-classification-row"><StatusBadge type={pr.reviewType} /></div>
                  <p className="signal-eval-reason">Reason: {pr.classificationReason}</p>
                </div>

                <div className="signal-eval-block">
                  <h5>Follow-up activity</h5>
                  <ul>
                    <li>Fix-related commit detected {firstLabel}</li>
                    <li>Same file affected: Yes</li>
                  </ul>
                </div>

                <div className="signal-eval-verdict">
                  <span className="signal-verdict-badge">WORTH INVESTIGATING</span>
                  <span className="signal-eval-caveat">⚠ Correlation does not imply causation.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
