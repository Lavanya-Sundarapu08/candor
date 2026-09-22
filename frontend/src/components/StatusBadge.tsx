import type { ReviewType } from '../api/types'

const LABEL: Record<ReviewType, string> = {
  SUBSTANTIVE: 'substantive',
  SUPERFICIAL: 'superficial',
  NONE: 'no review comments'
}

export default function StatusBadge({ type }: { type: ReviewType }) {
  return <span className={`badge ${type}`}>{LABEL[type]}</span>
}
