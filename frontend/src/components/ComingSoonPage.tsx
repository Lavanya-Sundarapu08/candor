import { Construction } from 'lucide-react'

interface Props {
  title: string
  description: string
}

export default function ComingSoonPage({ title, description }: Props) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <div className="coming-soon-card">
        <Construction size={28} className="coming-soon-icon" />
        <p className="coming-soon-title">Coming in a later update</p>
        <p className="coming-soon-desc">{description}</p>
      </div>
    </div>
  )
}
