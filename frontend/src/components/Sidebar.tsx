import type { ReactNode } from 'react'
import {
  FolderGit2, KeyRound, LayoutGrid, GitPullRequest, ShieldAlert,
  Grid3x3, SlidersHorizontal, Users, BarChart3, FileText, History, LogOut
} from 'lucide-react'
import type { Page } from '../App'

interface NavItem {
  page: Page
  label: string
  icon: ReactNode
  badge?: string
}

const TOP_ITEMS: NavItem[] = [
  { page: 'select-repo', label: 'Connect Repository', icon: <FolderGit2 size={17} /> },
  { page: 'github-pat', label: 'VCS Token Configuration', icon: <KeyRound size={17} /> }
]

const INTEL_ITEMS: NavItem[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={17} /> },
  { page: 'pull-requests', label: 'Pull Requests', icon: <GitPullRequest size={17} /> },
  { page: 'risk-signals', label: 'Risk Signals', icon: <ShieldAlert size={17} /> },
  { page: '2d-risk-matrix', label: '2D Risk Matrix', icon: <Grid3x3 size={17} /> },
  { page: 'rules-playground', label: 'Rule Simulator Lab', icon: <SlidersHorizontal size={17} /> },
  { page: 'reviewer-roster', label: 'Reviewer Roster', icon: <Users size={17} /> },
  { page: 'quality-analytics', label: 'Quality Analytics', icon: <BarChart3 size={17} /> },
  { page: 'sprint-audit-report', label: 'Sprint Audit Report', icon: <FileText size={17} /> },
  { page: 'analysis-runs', label: 'Analysis Runs', icon: <History size={17} /> }
]

interface Props {
  current: Page
  onNavigate: (page: Page) => void
  username: string
  onLogout: () => void
}

export default function Sidebar({ current, onNavigate, username, onLogout }: Props) {
  const initial = username ? username[0].toUpperCase() : '?'
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-avatar">C</div>
        <div className="brand-text">
          <div className="brand-name">Candor</div>
          <div className="brand-subtitle">Code Review Intelligence</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {TOP_ITEMS.map((item) => (
          <NavButton key={item.page} item={item} active={current === item.page} onClick={() => onNavigate(item.page)} />
        ))}

        <div className="sidebar-section-label">Analytics &amp; Audit</div>

        {INTEL_ITEMS.map((item) => (
          <NavButton key={item.page} item={item} active={current === item.page} onClick={() => onNavigate(item.page)} />
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-user">
          <div className="footer-avatar">{initial}</div>
          <div className="footer-text">
            <div className="footer-name">{username || 'Guest'}</div>
            <div className="footer-email">{username ? `${username}@candor.local` : ''}</div>
          </div>
        </div>
        <button className="footer-logout-btn" onClick={onLogout} aria-label="Log out" title="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="nav-icon">{item.icon}</span>
      <span className="nav-label">{item.label}</span>
      {item.badge && <span className={`nav-badge ${item.badge === 'SOON' ? 'soon' : ''}`}>{item.badge}</span>}
    </button>
  )
}
