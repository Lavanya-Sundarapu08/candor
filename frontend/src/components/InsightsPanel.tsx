interface Props {
  insights: string[]
}

export default function InsightsPanel({ insights }: Props) {
  if (!insights || insights.length === 0) return null

  return (
    <div className="insights-card">
      <h2>Insights</h2>
      <ul>
        {insights.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  )
}
