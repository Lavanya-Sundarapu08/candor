import { useState } from 'react'
import { Info } from 'lucide-react'
import type { PullRequestAnalysis } from '../api/types'
import { scoreComment } from '../utils/classifierRules'

interface Props {
  pullRequests: PullRequestAnalysis[]
}

interface Point {
  pr: PullRequestAnalysis
  score: number
  days: number
}

function earliestDaysToFix(pr: PullRequestAnalysis): number | null {
  const deltas = pr.followUpFixes
    .map((f) => {
      if (!f.commitDate) return null
      const from = new Date(pr.mergedAt).getTime()
      const to = new Date(f.commitDate).getTime()
      if (Number.isNaN(from) || Number.isNaN(to)) return null
      return (to - from) / (1000 * 60 * 60 * 24)
    })
    .filter((d): d is number => d !== null)
  return deltas.length > 0 ? Math.min(...deltas) : null
}

export default function RiskMatrixPage({ pullRequests }: Props) {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'MEDIUM' | 'LOW'>('ALL')

  const points: Point[] = pullRequests
    .filter((pr) => pr.followUpFixes.length > 0)
    .map((pr) => {
      const score = scoreComment(pr.reviewSnippet).score
      const days = earliestDaysToFix(pr)
      return days === null ? null : { pr, score, days }
    })
    .filter((p): p is Point => p !== null)

  function zoneOf(p: Point): 'CRITICAL' | 'MEDIUM' | 'LOW' {
    if (p.score < 50 && p.days <= 7) return 'CRITICAL'
    if (p.score < 50) return 'MEDIUM'
    return 'LOW'
  }

  const shown = filter === 'ALL' ? points : points.filter((p) => zoneOf(p) === filter)

  const width = 720
  const height = 420
  const padding = 50
  const maxDays = Math.max(14, ...points.map((p) => p.days))

  function xPos(score: number) { return padding + (score / 100) * (width - padding * 2) }
  function yPos(days: number) { return height - padding - (Math.min(days, maxDays) / maxDays) * (height - padding * 2) }

  return (
    <div className="page-header">
      <div className="page-eyebrow">2D Risk Quadrant Grid</div>
      <h1>Correlation Risk Matrix</h1>
      <p className="page-subtitle">
        Each point is a PR that showed follow-up fix activity, plotted by its comment's substance
        score (x-axis) against how quickly the fix followed (y-axis). PRs with no follow-up
        activity have no time-to-fix value and aren't shown here.
      </p>

      <div className="filter-row">
        {(['ALL', 'CRITICAL', 'MEDIUM', 'LOW'] as const).map((f) => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="matrix-card">
        <div className="matrix-card-header">
          <span>Risk Quadrant Distribution ({shown.length} events plotted)</span>
          <span className="matrix-legend">
            <span className="legend-dot critical" /> Critical <span className="legend-dot medium" /> Medium <span className="legend-dot low" /> Low
          </span>
        </div>

        {points.length === 0 ? (
          <div className="empty-panel">
            <Info size={20} className="empty-panel-icon" />
            <p>No PRs with follow-up fix activity to plot yet.</p>
            <p className="empty-panel-sub">Run an analysis on a repo with detected follow-up signals.</p>
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Scatter plot of substance score vs days to fix">
            <line x1={xPos(50)} y1={padding} x2={xPos(50)} y2={height - padding} stroke="var(--color-border)" strokeDasharray="4 4" />
            <line x1={padding} y1={yPos(7)} x2={width - padding} y2={yPos(7)} stroke="var(--color-border)" strokeDasharray="4 4" />

            <text x={padding + 4} y={padding + 14} fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-del)">CRITICAL: low substance + fast fix (&le;7d)</text>
            <text x={width - padding - 4} y={padding + 14} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-text-muted)">safer zone</text>

            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--color-text-muted)" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--color-text-muted)" />

            <text x={width / 2} y={height - 10} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--color-text-muted)">Review Substance Score &rarr;</text>
            <text x={14} y={height / 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--color-text-muted)" transform={`rotate(-90 14 ${height / 2})`}>Days to Fix &rarr;</text>

            {shown.map((p) => {
              const zone = zoneOf(p)
              const color = zone === 'CRITICAL' ? 'var(--color-del)' : zone === 'MEDIUM' ? 'var(--color-warn)' : 'var(--color-accent)'
              return (
                <circle key={p.pr.prNumber} cx={xPos(p.score)} cy={yPos(p.days)} r={6} fill={color} fillOpacity={0.85}>
                  <title>#{p.pr.prNumber} — score {p.score}, {p.days.toFixed(1)}d to fix</title>
                </circle>
              )
            })}
          </svg>
        )}
      </div>
    </div>
  )
}
