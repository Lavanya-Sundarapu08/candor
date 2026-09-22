import { FormEvent, useState } from 'react'
import { FolderGit2, ArrowRight } from 'lucide-react'

interface Props {
  owner: string
  repo: string
  onConnect: (owner: string, repo: string) => void
  hasResult: boolean
  totalAnalyzed: number
  onGoToDashboard: () => void
}

export default function RepositoryPage({ owner, repo, onConnect, hasResult, totalAnalyzed, onGoToDashboard }: Props) {
  const [newOwner, setNewOwner] = useState('')
  const [newRepo, setNewRepo] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!newOwner.trim() || !newRepo.trim()) return
    onConnect(newOwner.trim(), newRepo.trim())
    setNewOwner('')
    setNewRepo('')
  }

  return (
    <div className="page-header">
      <h1>Connected Repositories</h1>
      <p className="page-subtitle">
        Select a repository to inspect pull-request reviews, calculate substance scores, and detect
        follow-up fix signals.
      </p>

      <form className="connect-repo-card" onSubmit={handleSubmit}>
        <div className="connect-repo-title">
          <FolderGit2 size={16} /> Connect a GitHub repository
        </div>
        <div className="connect-repo-row">
          <input value={newOwner} onChange={(e) => setNewOwner(e.target.value)} placeholder="Owner (e.g. spring-projects)" />
          <input value={newRepo} onChange={(e) => setNewRepo(e.target.value)} placeholder="Repository (e.g. spring-petclinic)" />
          <button type="submit" className="btn-run">
            Connect <ArrowRight size={14} />
          </button>
        </div>
      </form>

      {owner && repo && (
        <div className="repo-card">
          <div className="repo-card-top">
            <span className="repo-card-label">Active</span>
            <span className={`repo-status-pill ${hasResult ? 'healthy' : ''}`}>{hasResult ? 'Analyzed' : 'Not yet analyzed'}</span>
          </div>
          <div className="repo-card-name">{owner}/{repo}</div>
          <div className="repo-card-footer">
            <span>{totalAnalyzed} PRs analyzed</span>
            <button className="repo-dashboard-link" onClick={onGoToDashboard}>
              Dashboard <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
