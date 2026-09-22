import type { ReactNode, CSSProperties } from 'react'
import { GitPullRequest, CheckCircle2, ShieldAlert, RefreshCw, Play, Grid3x3, SlidersHorizontal, FileText, ArrowRight } from 'lucide-react'
import type { AnalysisSummary } from '../api/types'
import type { Page } from '../App'
import CoverageBanner from './CoverageBanner'
import InsightsPanel from './InsightsPanel'

interface Props {
  owner: string
  repo: string
  limit: number
  onLimitChange: (n: number) => void
  loading: boolean
  error: string | null
  summary: AnalysisSummary | null
  onRunAnalysis: () => void
  onNavigate: (page: Page) => void
}

export default function DashboardPage({ owner, repo, limit, onLimitChange, loading, error, summary, onRunAnalysis, onNavigate }: Props) {
  const reviewDepthIndex = summary && summary.reviewedCount > 0
    ? Math.round((summary.substantiveCount / summary.reviewedCount) * 100)
    : 0

  if (!owner || !repo) {
    return (
      <div className="page-header">
        <h1>Repository Analysis Center</h1>
        <div className="empty-panel">
          <p>No repository selected yet.</p>
          <p className="empty-panel-sub">Go to "Select Repository" to connect one first.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-header">
      <div className="dashboard-top-row">
        <div>
          <div className="page-eyebrow">Repository Analysis Center</div>
          <h1>{owner}/{repo}</h1>
          <p className="page-subtitle-inline">
            {summary ? `${summary.totalAnalyzed} PRs analyzed` : 'Not yet analyzed'}
          </p>
        </div>
        <div className="dashboard-controls">
          <label className="limit-control">
            PRs
            <input type="number" min={1} max={30} value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} />
          </label>
          <button className="btn-secondary" onClick={onRunAnalysis} disabled={loading}>
            <RefreshCw size={14} /> Sync GitHub
          </button>
          <button className="btn-run" onClick={onRunAnalysis} disabled={loading}>
            <Play size={14} /> {loading ? 'Running...' : `Run Analysis`}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">Error: {error}</div>}

      <div className="kpi-grid">
        <KpiCard icon={<GitPullRequest size={18} />} label="PRs Imported" value={summary?.totalAnalyzed ?? 0} sub="Analyzed from GitHub" color="accent" />
        <KpiCard icon={<CheckCircle2 size={18} />} label="Reviews Scored" value={summary?.reviewedCount ?? 0} sub="Substance evaluated" color="info" />
        <KpiCard icon={<ShieldAlert size={18} />} label="Flagged Risk Events" value={summary?.riskyApprovalCount ?? 0} sub="Superficial + follow-up fix" color="del" />
        <div className="stat-card kpi-card">
          <div className="kpi-card-top">
            <span className="stat-label">Review Depth Index</span>
          </div>
          <div className="gauge-row">
            <div className="gauge-ring" style={{ '--pct': reviewDepthIndex } as CSSProperties}>
              <div className="gauge-ring-inner">{reviewDepthIndex}%</div>
            </div>
            <div className="gauge-caption">
              {summary && summary.reviewedCount > 0
                ? 'based on substantive ÷ reviewed PRs'
                : 'no review data yet'}
            </div>
          </div>
        </div>
      </div>

      <div className="quick-links-grid">
        <QuickLinkCard icon={<Grid3x3 size={16} />} title="2D Risk Matrix" desc="Plot review substance vs. days to post-merge fix." onClick={() => onNavigate('2d-risk-matrix')} />
        <QuickLinkCard icon={<SlidersHorizontal size={16} />} title="Rules Playground" desc="Test review comments & commit heuristic scores." onClick={() => onNavigate('rules-playground')} />
        <QuickLinkCard icon={<FileText size={16} />} title="Sprint Audit Report" desc="Export a markdown audit summary for retrospectives." onClick={() => onNavigate('sprint-audit-report')} />
      </div>

      {summary && (
        <>
          <CoverageBanner summary={summary} />
          <InsightsPanel insights={summary.insights} />
        </>
      )}
    </div>
  )
}

function KpiCard({ icon, label, value, sub, color }: { icon: ReactNode; label: string; value: number; sub: string; color: string }) {
  return (
    <div className="stat-card kpi-card">
      <div className="kpi-card-top">
        <span className="stat-label">{label}</span>
        <span className={`kpi-icon-box ${color}`}>{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  )
}

function QuickLinkCard({ icon, title, desc, onClick }: { icon: ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button className="quick-link-card" onClick={onClick}>
      <div className="quick-link-title">{icon} {title}</div>
      <div className="quick-link-desc">{desc}</div>
      <ArrowRight size={14} className="quick-link-arrow" />
    </button>
  )
}
