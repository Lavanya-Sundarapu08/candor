import type { AnalysisResponse, AnalyzeRequest, HistoryEntry } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

export interface AuthResponse {
  token: string
  username: string
}

export interface JobSubmitted {
  jobId: string
}

export type JobStatusValue = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface JobStatusResponse {
  jobId: string
  status: JobStatusValue
  result: AnalysisResponse | null
  errorMessage: string | null
}

export interface AIInsightRequestPayload {
  prNumber: number
  prTitle: string
  reviewSnippet: string
  reviewType: string
  classificationReason: string
  hadFollowUpFix: boolean
  followUpSummaries: string[]
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })
  if (!res.ok) {
    const body = await safeJson(res)
    throw new Error(body?.error ?? `Registration failed with status ${res.status}`)
  }
  return res.json()
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) {
    const body = await safeJson(res)
    throw new Error(body?.error ?? `Login failed with status ${res.status}`)
  }
  return res.json()
}

// Legacy synchronous analyze - kept working, but the app now uses the async
// Kafka-backed path below for the main "Run Analysis" flow.
export async function analyzeRepo(request: AnalyzeRequest, authToken: string): Promise<AnalysisResponse> {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(request)
  })
  if (!res.ok) {
    const body = await safeJson(res)
    throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  }
  return res.json()
}

export async function submitAnalysisJob(request: AnalyzeRequest, authToken: string): Promise<JobSubmitted> {
  const res = await fetch(`${BASE_URL}/analyze/async`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(request)
  })
  if (!res.ok) {
    const body = await safeJson(res)
    throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  }
  return res.json()
}

export async function getJobStatus(jobId: string, authToken: string): Promise<JobStatusResponse> {
  const res = await fetch(`${BASE_URL}/analyze/async/${jobId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  })
  if (!res.ok) {
    const body = await safeJson(res)
    throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  }
  return res.json()
}

export async function generateAIInsight(payload: AIInsightRequestPayload, authToken: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/ai-insight/pr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const body = await safeJson(res)
    throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  }
  const data = await res.json()
  return data.interpretation as string
}

export async function fetchHistory(owner: string, repo: string, authToken: string): Promise<HistoryEntry[]> {
  const params = new URLSearchParams({ owner, repo })
  const res = await fetch(`${BASE_URL}/history?${params.toString()}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  })
  if (!res.ok) {
    const body = await safeJson(res)
    throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  }
  return res.json()
}

async function safeJson(res: Response): Promise<{ error?: string } | null> {
  try {
    return await res.json()
  } catch {
    return null
  }
}
