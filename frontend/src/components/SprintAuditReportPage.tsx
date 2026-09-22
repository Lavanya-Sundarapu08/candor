import { useState } from 'react'
import { Copy, Download, FileText, Check } from 'lucide-react'
import type { AnalysisResponse } from '../api/types'

interface Props {
  result: AnalysisResponse | null
  owner: string
  repo: string
}

function buildMarkdown(result: AnalysisResponse | null, owner: string, repo: string): string {
  const today = new Date().toISOString().slice(0, 10)
  if (!result) {
    return `# Candor Code Review Quality & Risk Audit Report\n\n**Repository**: ${owner}/${repo}\n**Generated Date**: ${today}\n\nNo analysis has been run yet for this repository.`
  }

  const s = result.summary
  const lines: string[] = []
  lines.push('# Candor Code Review Quality & Risk Audit Report')
  lines.push('')
  lines.push(`**Repository**: ${owner}/${repo}`)
  lines.push(`**Generated Date**: ${today}`)
  lines.push('**Deterministic Engine**: Active (14-day post-merge correlation window)')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 1. Executive Summary')
  lines.push(`- **Total Pull Requests Analyzed**: ${s.totalAnalyzed}`)
  lines.push(`- **Total Reviews Evaluated**: ${s.reviewedCount}`)
  lines.push(`- **Flagged Risk Events**: ${s.riskyApprovalCount}`)
  lines.push(`- **Superficial Rate**: ${s.superficialRatePercent === null ? 'N/A (no review data)' : s.superficialRatePercent.toFixed(0) + '%'}`)
  lines.push(`- **PRs with Follow-up Fix Activity**: ${s.followUpFixCount} (${s.followUpFixRatePercent.toFixed(0)}%)`)
  lines.push('')
  lines.push('> **Core Foundational Tenet**: Candor does not claim that a reviewer caused a defect. It provides')
  lines.push('> an observed correlation signal where PR approvals of low review substance overlap with')
  lines.push('> subsequent bug-fix commits within the monitored time window.')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 2. Reviewer Substance & Reliability Summary')
  if (s.reviewerLeaderboard.length === 0) {
    lines.push('No reviewer statistics available for this dataset.')
  } else {
    lines.push('| Reviewer | Substantive | Superficial | Follow-up Signals | Score |')
    lines.push('|---|---|---|---|---|')
    for (const r of s.reviewerLeaderboard) {
      lines.push(`| ${r.reviewer} | ${r.substantiveCount} | ${r.superficialCount} | ${r.followUpFixSignalCount} | ${r.score >= 0 ? '+' : ''}${r.score} |`)
    }
  }
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 3. Flagged Risk Events')
  const flagged = result.pullRequests.filter((pr) => pr.hadFollowUpFix)
  if (flagged.length === 0) {
    lines.push('No follow-up fix activity detected in this sample.')
  } else {
    for (const pr of flagged) {
      lines.push(`- **#${pr.prNumber} — ${pr.title}** (${pr.reviewType.toLowerCase()}) — ${pr.followUpFixes.length} related follow-up ${pr.followUpFixes.length === 1 ? 'fix' : 'fixes'}, first ${pr.followUpFixes[0]?.timeAfterMerge}`)
    }
  }
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 4. Insights')
  for (const insight of s.insights) {
    lines.push(`- ${insight}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*This report is generated entirely from analyzed GitHub data using deterministic, rule-based')
  lines.push('logic. It contains no AI-generated or fabricated content, and no confidence scores.*')

  return lines.join('\n')
}

export default function SprintAuditReportPage({ result, owner, repo }: Props) {
  const [copied, setCopied] = useState(false)
  const markdown = buildMarkdown(result, owner, repo)

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `candor-audit-${owner}-${repo}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadCsv() {
    if (!result || !result.pullRequests.length) return
    const headers = ['PR Number', 'Title', 'Author', 'Merged At', 'Review Type', 'Review Snippet', 'Had Follow-Up Fix', 'Follow-Up Fixes Count', 'Files Changed']
    const rows = result.pullRequests.map(pr => [
      pr.prNumber,
      `"${pr.title.replace(/"/g, '""')}"`,
      `"${pr.author}"`,
      `"${pr.mergedAt}"`,
      pr.reviewType,
      `"${(pr.reviewSnippet || '').replace(/"/g, '""')}"`,
      pr.hadFollowUpFix ? 'YES' : 'NO',
      pr.followUpFixes.length,
      pr.filesChanged.length
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `candor-audit-${owner}-${repo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-header">
      <div className="dashboard-top-row">
        <div>
          <div className="page-eyebrow">Sprint Audit &amp; Compliance Export</div>
          <h1>Executive Quality Audit Report</h1>
          <p className="page-subtitle-inline">Export a markdown report for sprint retrospectives and team health audits.</p>
        </div>
        <div className="dashboard-controls">
          <button className="btn-secondary" onClick={handleDownloadCsv} disabled={!result || !result.pullRequests.length} title="Download CSV for Excel">
            <Download size={14} /> Download .csv Data
          </button>
          <button className="btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Markdown'}
          </button>
          <button className="btn-run" onClick={handleDownload}>
            <Download size={14} /> Download .md Report
          </button>
        </div>
      </div>

      <div className="report-preview-card">
        <div className="report-preview-header">
          <span><FileText size={14} /> Report preview</span>
        </div>
        <pre className="report-preview-body">{markdown}</pre>
      </div>
    </div>
  )
}
