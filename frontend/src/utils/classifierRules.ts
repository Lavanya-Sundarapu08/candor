// Mirrors the exact rules used by the real backend classifier
// (backend/src/main/java/com/candor/service/CommentClassifier.java) so the
// Rules Playground and 2D Risk Matrix never diverge from what the actual
// analysis engine computes. Presentational scoring only - the underlying
// SUBSTANTIVE/SUPERFICIAL/NONE label always matches the backend's logic.

export const SHORT_COMMENT_THRESHOLD = 25
export const RESIDUAL_CONTENT_THRESHOLD = 12

export const STOCK_PHRASES = [
  'looks good to me', 'looks good', 'nice work', 'good job',
  'lgtm', 'approved', 'great', 'nice', 'okay', 'ok', 'good', '+1'
]

export const FIX_KEYWORDS = ['fix', 'fixes', 'fixed', 'bug', 'hotfix', 'patch', 'revert', 'regression']

export type ReviewTypeLabel = 'SUBSTANTIVE' | 'SUPERFICIAL' | 'NONE'

function isMostlyStockPhrases(normalized: string): boolean {
  let residual = normalized
  const sorted = [...STOCK_PHRASES].sort((a, b) => b.length - a.length)
  for (const phrase of sorted) {
    residual = residual.split(phrase).join('')
  }
  residual = residual.replace(/[^a-z0-9]/g, '')
  return residual.length < RESIDUAL_CONTENT_THRESHOLD
}

export function classifyComment(comment: string): ReviewTypeLabel {
  if (!comment || !comment.trim()) return 'NONE'
  const normalized = comment.trim().toLowerCase()
  if (normalized.length < SHORT_COMMENT_THRESHOLD) return 'SUPERFICIAL'
  if (isMostlyStockPhrases(normalized)) return 'SUPERFICIAL'
  return 'SUBSTANTIVE'
}

export interface ScoreBreakdownItem {
  label: string
  points: number
}

export interface SubstanceScoreResult {
  score: number
  label: ReviewTypeLabel
  breakdown: ScoreBreakdownItem[]
}

// Presentational point scale built on the same two real rules the backend
// uses. Not a separate model - just a way to visualize the same binary
// decision as a 0-100 score for the scatter plot and playground.
export function scoreComment(comment: string): SubstanceScoreResult {
  const label = classifyComment(comment)

  if (label === 'NONE') {
    return { score: 0, label, breakdown: [{ label: 'No review comment provided', points: 0 }] }
  }

  const normalized = comment.trim().toLowerCase()
  const len = comment.trim().length
  let score = 50
  const breakdown: ScoreBreakdownItem[] = []

  if (len >= SHORT_COMMENT_THRESHOLD) {
    score += 20
    breakdown.push({ label: `Comment length is substantial (${len} chars)`, points: 20 })
  } else {
    score -= 30
    breakdown.push({ label: `Comment is brief (${len} chars) - too short for real feedback`, points: -30 })
  }

  if (isMostlyStockPhrases(normalized)) {
    score -= 35
    breakdown.push({ label: 'Generic approval phrase detected (e.g. "LGTM", "looks good")', points: -35 })
  } else {
    score += 25
    breakdown.push({ label: 'No generic approval pattern - comment contains specific content', points: 25 })
  }

  return { score: Math.max(0, Math.min(100, score)), label, breakdown }
}

export interface FixMatchResult {
  matched: boolean
  keyword: string | null
  strength: string
}

export function evaluateCommitMessage(message: string): FixMatchResult {
  if (!message || !message.trim()) {
    return { matched: false, keyword: null, strength: 'No commit message provided' }
  }
  const lower = message.trim().toLowerCase()
  const keyword = FIX_KEYWORDS.find((k) => lower.includes(k)) ?? null
  return {
    matched: keyword !== null,
    keyword,
    strength: keyword ? `Strong keyword match on "${keyword}"` : 'No fix-related keyword detected'
  }
}
