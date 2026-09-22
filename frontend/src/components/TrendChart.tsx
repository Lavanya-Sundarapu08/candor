import type { PullRequestAnalysis } from '../api/types'

interface Props {
  pullRequests: PullRequestAnalysis[]
}

interface MonthBucket {
  month: string
  label: string
  total: number
  superficial: number
}

function buildMonthBuckets(pullRequests: PullRequestAnalysis[]): MonthBucket[] {
  const map = new Map<string, MonthBucket>()

  const reviewedPRs = pullRequests.filter((pr) => pr.reviewType !== 'NONE')

  for (const pr of reviewedPRs) {
    const date = new Date(pr.mergedAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })

    if (!map.has(key)) {
      map.set(key, { month: key, label, total: 0, superficial: 0 })
    }
    const bucket = map.get(key)!
    bucket.total += 1
    if (pr.reviewType === 'SUPERFICIAL') {
      bucket.superficial += 1
    }
  }

  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month))
}

export default function TrendChart({ pullRequests }: Props) {
  const buckets = buildMonthBuckets(pullRequests)

  if (buckets.length < 2) {
    return null
  }

  const chartWidth = 640
  const chartHeight = 160
  const barGap = 12
  const barWidth = Math.min(48, (chartWidth - barGap * (buckets.length - 1)) / buckets.length)

  return (
    <div className="chart-card">
      <h2>Superficial review rate by month</h2>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} width="100%" role="img" aria-label="Bar chart of superficial review rate by month">
        {buckets.map((bucket, i) => {
          const rate = bucket.total === 0 ? 0 : bucket.superficial / bucket.total
          const barHeight = Math.max(2, rate * chartHeight)
          const x = i * (barWidth + barGap)
          const y = chartHeight - barHeight

          return (
            <g key={bucket.month}>
              <rect x={x} y={y} width={barWidth} height={barHeight}
                fill={rate >= 0.5 ? 'var(--color-del)' : rate >= 0.2 ? 'var(--color-warn)' : 'var(--color-add)'}
                rx={2} />
              <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text-muted)">
                {bucket.label}
              </text>
              <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text)">
                {Math.round(rate * 100)}%
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
