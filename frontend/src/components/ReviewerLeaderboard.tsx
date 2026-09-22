import type { ReviewerStat } from '../api/types'

interface Props {
  leaderboard: ReviewerStat[]
}

export default function ReviewerLeaderboard({ leaderboard }: Props) {
  if (!leaderboard || leaderboard.length === 0) return null

  return (
    <div className="leaderboard-card">
      <h2>Reviewer signals</h2>
      <p className="leaderboard-hint">
        Substantive vs. superficial comment counts and how often each reviewer's PRs later showed
        follow-up fix activity. This describes patterns in the comments left, not a judgment of the
        person.
      </p>
      <div className="leaderboard-table">
        <div className="leaderboard-row head">
          <div>Reviewer</div>
          <div>Substantive</div>
          <div>Superficial</div>
          <div>Follow-up signals</div>
          <div>Score</div>
        </div>
        {leaderboard.map((r) => (
          <div key={r.reviewer} className="leaderboard-row">
            <div className="reviewer-name">{r.reviewer}</div>
            <div className="plus">+{r.substantiveCount}</div>
            <div className="minus">-{r.superficialCount}</div>
            <div className="follow-up-signal-count">
              {r.followUpFixSignalCount > 0 ? `⚠ ${r.followUpFixSignalCount}` : '—'}
            </div>
            <div className={`score ${r.score >= 0 ? 'positive' : 'negative'}`}>
              {r.score >= 0 ? '+' : ''}{r.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
