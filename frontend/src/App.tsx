import { useState } from 'react'
import { Activity, ShieldCheck } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ThemeToggle from './components/ThemeToggle'
import AuthPage from './components/AuthPage'
import DashboardPage from './components/DashboardPage'
import RepositoryPage from './components/RepositoryPage'
import GitHubPatPage from './components/GitHubPatPage'
import RiskSignalsPage from './components/RiskSignalsPage'
import RiskMatrixPage from './components/RiskMatrixPage'
import RulesPlaygroundPage from './components/RulesPlaygroundPage'
import SprintAuditReportPage from './components/SprintAuditReportPage'
import AnalysisTable from './components/AnalysisTable'
import ReviewerLeaderboard from './components/ReviewerLeaderboard'
import AnalyticsSection from './components/AnalyticsSection'
import TrendChart from './components/TrendChart'
import HistoryPage from './components/HistoryPage'
import { submitAnalysisJob, getJobStatus, analyzeRepo } from './api/candorApi'
import type { AnalysisResponse } from './api/types'
import './styles/tokens.css'
import './styles/app.css'

export type Page =
  | 'select-repo' | 'github-pat' | 'dashboard' | 'pull-requests' | 'risk-signals'
  | '2d-risk-matrix' | 'rules-playground' | 'reviewer-roster' | 'quality-analytics'
  | 'sprint-audit-report' | 'analysis-runs'

const PAGE_TITLES: Record<Page, string> = {
  'select-repo': 'Select Repository',
  'github-pat': 'GitHub PAT Setup',
  'dashboard': 'Dashboard',
  'pull-requests': 'Pull Requests',
  'risk-signals': 'Risk Signals',
  '2d-risk-matrix': '2D Risk Matrix',
  'rules-playground': 'Rules Playground',
  'reviewer-roster': 'Reviewer Roster',
  'quality-analytics': 'Quality Analytics',
  'sprint-audit-report': 'Sprint Audit Report',
  'analysis-runs': 'Analysis Runs'
}

export default function App() {
  // Auth token is kept in memory only (not localStorage) to limit exposure -
  // a page refresh requires logging in again. This is a deliberate tradeoff.
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [authUsername, setAuthUsername] = useState<string>('')

  const [page, setPage] = useState<Page>('select-repo')
  const [owner, setOwner] = useState('spring-projects')
  const [repo, setRepo] = useState('spring-boot')
  const [token, setToken] = useState('')
  const [limit, setLimit] = useState(10)

  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAuthenticated(newToken: string, username: string) {
    setAuthToken(newToken)
    setAuthUsername(username)
  }

  function handleLogout() {
    setAuthToken(null)
    setAuthUsername('')
    setResult(null)
    setPage('select-repo')
  }

  function handleSaveGitHubToken(newToken: string) {
    setToken(newToken)
    window.localStorage.setItem('candor-github-token', newToken)
  }

  async function runAnalysis() {
    if (!owner || !repo || !authToken) return
    setLoading(true)
    setError(null)
    try {
      const { jobId } = await submitAnalysisJob({ owner, repo, token: token || undefined, limit }, authToken)
      await pollJobUntilDone(jobId, authToken)
    } catch (err) {
      console.warn('Async pipeline call failed, falling back to direct analysis:', err)
      try {
        const fallbackResult = await analyzeRepo({ owner, repo, token: token || undefined, limit }, authToken)
        setResult(fallbackResult)
        setLoading(false)
      } catch (fallbackErr) {
        setError(fallbackErr instanceof Error ? fallbackErr.message : 'Something went wrong.')
        setResult(null)
        setLoading(false)
      }
    }
  }

  async function pollJobUntilDone(jobId: string, tokenForAuth: string) {
    const status = await getJobStatus(jobId, tokenForAuth)
    if (status.status === 'COMPLETED') {
      setResult(status.result)
      setLoading(false)
    } else if (status.status === 'FAILED') {
      setError(status.errorMessage ?? 'Analysis failed.')
      setResult(null)
      setLoading(false)
    } else {
      // PENDING or RUNNING - the Kafka consumer is still working through the job.
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await pollJobUntilDone(jobId, tokenForAuth)
    }
  }

  function handleConnect(newOwner: string, newRepo: string) {
    setOwner(newOwner)
    setRepo(newRepo)
    setResult(null)
    setPage('dashboard')
  }

  if (!authToken) {
    return <AuthPage onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="app-shell">
      <Sidebar current={page} onNavigate={setPage} username={authUsername} onLogout={handleLogout} />

      <div className="main-column">
        <div className="top-bar">
          <div className="top-bar-brand">
            <span className="top-bar-repo">{owner}/{repo}</span>
            <span className="top-bar-separator">/</span>
            <span className="top-bar-page">{PAGE_TITLES[page]}</span>
          </div>
          <div className="top-bar-status">
            <span className="system-status-pill">
              <span className="status-dot"></span> System Online
            </span>
            <ThemeToggle />
          </div>
        </div>

        <main className="page-content">
          {page === 'select-repo' && (
            <RepositoryPage
              owner={owner} repo={repo} onConnect={handleConnect}
              hasResult={!!result} totalAnalyzed={result?.summary.totalAnalyzed ?? 0}
              onGoToDashboard={() => setPage('dashboard')}
            />
          )}

          {page === 'github-pat' && <GitHubPatPage token={token} onSave={handleSaveGitHubToken} />}

          {page === 'dashboard' && (
            <DashboardPage
              owner={owner} repo={repo} limit={limit} onLimitChange={setLimit}
              loading={loading} error={error} summary={result?.summary ?? null}
              onRunAnalysis={runAnalysis} onNavigate={setPage}
            />
          )}

          {page === 'pull-requests' && (
            <div className="page-header">
              <h1>{PAGE_TITLES[page]}</h1>
              <p className="page-subtitle">Browse imported pull requests and inspect review feedback substance.</p>
              <AnalysisTable pullRequests={result?.pullRequests ?? []} authToken={authToken} />
            </div>
          )}

          {page === 'risk-signals' && <RiskSignalsPage pullRequests={result?.pullRequests ?? []} />}

          {page === '2d-risk-matrix' && <RiskMatrixPage pullRequests={result?.pullRequests ?? []} />}

          {page === 'rules-playground' && <RulesPlaygroundPage />}

          {page === 'reviewer-roster' && (
            <div className="page-header">
              <h1>{PAGE_TITLES[page]}</h1>
              <ReviewerLeaderboard leaderboard={result?.summary.reviewerLeaderboard ?? []} />
              {(!result || result.summary.reviewerLeaderboard.length === 0) && (
                <div className="empty-panel"><p>No reviewer statistics tabulated yet. Run an analysis first.</p></div>
              )}
            </div>
          )}

          {page === 'quality-analytics' && (
            <div className="page-header">
              <h1>{PAGE_TITLES[page]}</h1>
              <p className="page-subtitle">Longitudinal review quality assessment and risk signal patterns.</p>
              {result ? (
                <>
                  <AnalyticsSection summary={result.summary} pullRequests={result.pullRequests} />
                  <TrendChart pullRequests={result.pullRequests} />
                </>
              ) : (
                <div className="empty-panel"><p>No historical trend data recorded yet.</p></div>
              )}
            </div>
          )}

          {page === 'sprint-audit-report' && <SprintAuditReportPage result={result} owner={owner} repo={repo} />}

          {page === 'analysis-runs' && (
            <div className="page-header">
              <h1>{PAGE_TITLES[page]}</h1>
              <p className="page-subtitle">Audit history of correlation engine execution passes and results.</p>
              <HistoryPage authToken={authToken} />
            </div>
          )}
        </main>

        <footer className="note app-footer">
          Public repos work without a token, limited to GitHub's 60 requests/hour anonymous rate limit.
          Set a personal access token in "GitHub PAT Setup" to raise that limit.
        </footer>
      </div>
    </div>
  )
}
