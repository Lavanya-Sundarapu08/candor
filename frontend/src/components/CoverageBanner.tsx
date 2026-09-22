import type { AnalysisSummary } from '../api/types'

interface Props {
  summary: AnalysisSummary
}

export default function CoverageBanner({ summary }: Props) {
  const total = summary.totalAnalyzed
  const reviewed = summary.reviewedCount
  const withoutReview = total - reviewed

  let coverageText: string
  if (reviewed === total) {
    coverageText = `${total} PRs analyzed · ${reviewed} with review comments`
  } else if (reviewed === 0) {
    coverageText = `${total} PRs analyzed · 0 with review comments · ${summary.followUpFixCount} with follow-up fix signals`
  } else {
    coverageText = `${total} PRs analyzed · ${reviewed} with review comments · ${withoutReview} without review comments`
  }

  return (
    <div className="coverage-banner">
      <div className="coverage-line">{coverageText}</div>
      {reviewed === 0 && (
        <div className="coverage-warning">
          ⚠ Review-quality classification unavailable because these PRs contain no review comments.
        </div>
      )}
    </div>
  )
}
