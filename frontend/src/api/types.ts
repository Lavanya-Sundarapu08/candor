export type ReviewType = 'SUBSTANTIVE' | 'SUPERFICIAL' | 'NONE'

export interface FollowUpFixEvidence {
  commitMessage: string
  file: string
  matchedKeyword: string
  commitDate: string | null
  timeAfterMerge: string
}

export interface PullRequestAnalysis {
  prNumber: number
  title: string
  author: string
  prCreatedAt: string
  mergedAt: string
  url: string
  reviewType: ReviewType
  reviewSnippet: string
  classificationReason: string
  reviewSubmittedAt: string | null
  filesChanged: string[]
  hadFollowUpFix: boolean
  followUpFixes: FollowUpFixEvidence[]
  riskyApproval?: boolean
}

export interface ReviewerStat {
  reviewer: string
  substantiveCount: number
  superficialCount: number
  totalReviews: number
  score: number
  followUpFixSignalCount: number
}

export interface AnalysisSummary {
  repo: string
  totalAnalyzed: number
  substantiveCount: number
  superficialCount: number
  noReviewCount: number
  reviewedCount: number
  followUpFixCount: number
  riskyApprovalCount: number
  superficialRatePercent: number | null
  followUpFixRatePercent: number
  riskyApprovalRatePercent: number
  insights: string[]
  reviewerLeaderboard: ReviewerStat[]
}

export interface AnalysisResponse {
  summary: AnalysisSummary
  pullRequests: PullRequestAnalysis[]
}

export interface AnalyzeRequest {
  owner: string
  repo: string
  token?: string
  limit: number
}

export interface HistoryEntry {
  id: number
  repoFullName: string
  prNumber: number
  title: string
  author: string
  mergedAt: string
  url: string
  reviewType: ReviewType
  reviewSnippet: string
  filesChanged: string[]
  hadFollowUpFix: boolean
  followUpCommitMessages: string[]
  analyzedAt: string
}
