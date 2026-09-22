import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { PullRequestAnalysis } from '../api/types'
import { generateAIInsight } from '../api/candorApi'

interface Props {
  pr: PullRequestAnalysis
  authToken: string
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'unknown time'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  })
}

const REVIEW_TYPE_LABEL: Record<string, string> = {
  SUBSTANTIVE: 'substantive',
  SUPERFICIAL: 'superficial',
  NONE: 'no review'
}

export default function PRDetailPanel({ pr, authToken }: Props) {
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const steps: { label: string; time: string }[] = [
    { label: 'PR opened', time: formatDate(pr.prCreatedAt) }
  ]
  if (pr.reviewSubmittedAt) {
    steps.push({ label: `Review comment (${REVIEW_TYPE_LABEL[pr.reviewType]})`, time: formatDate(pr.reviewSubmittedAt) })
  }
  steps.push({ label: 'Merged', time: formatDate(pr.mergedAt) })
  pr.followUpFixes.forEach((fix) => {
    steps.push({ label: `Follow-up commit — ${fix.file}`, time: `${formatDate(fix.commitDate)} (${fix.timeAfterMerge})` })
  })

  async function handleGenerateAI() {
    setAiLoading(true)
    setAiError(null)
    try {
      const followUpSummaries = pr.followUpFixes.map(
        (f) => `Commit on ${f.file} matched fix-related keyword "${f.matchedKeyword}", ${f.timeAfterMerge}`
      )
      const text = await generateAIInsight(
        {
          prNumber: pr.prNumber,
          prTitle: pr.title,
          reviewSnippet: pr.reviewSnippet,
          reviewType: pr.reviewType,
          classificationReason: pr.classificationReason,
          hadFollowUpFix: pr.hadFollowUpFix,
          followUpSummaries
        },
        authToken
      )
      setAiText(text)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="detail-panel">
      <a href={pr.url} target="_blank" rel="noreferrer" className="detail-panel-link">
        View PR #{pr.prNumber} on GitHub ↗
      </a>

      <div className="detail-section">
        <h3>Classified</h3>
        <p className="classification-reason">{pr.classificationReason}</p>
      </div>

      {pr.followUpFixes.length === 0 ? (
        <div className="detail-section">
          <p className="no-signal-note">
            No follow-up fix activity was detected on the changed files within the review window.
          </p>
        </div>
      ) : (
        <>
          <div className="timeline">
            {steps.map((step, i) => (
              <div className="timeline-step" key={i}>
                <span className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-label">{step.label}</div>
                  <div className="timeline-time">{step.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="evidence-panel">
            <div className="evidence-col">
              <h4>Observed</h4>
              <ul>
                <li>PR merged {formatDate(pr.mergedAt)}</li>
                <li>{pr.filesChanged.length} file(s) changed in this PR</li>
                {pr.followUpFixes.map((fix, i) => (
                  <li key={i}>Commit on <code>{fix.file}</code> {fix.timeAfterMerge}</li>
                ))}
              </ul>
            </div>
            <div className="evidence-col">
              <h4>Classified</h4>
              <ul>
                <li>Review: {REVIEW_TYPE_LABEL[pr.reviewType]}</li>
                {pr.followUpFixes.map((fix, i) => (
                  <li key={i}>Commit message matched fix-related keyword "<code>{fix.matchedKeyword}</code>"</li>
                ))}
              </ul>
            </div>
            <div className="evidence-col">
              <h4>Signal</h4>
              <ul>
                <li>File overlap detected between this PR and the follow-up commit(s)</li>
                <li className="signal-caveat">
                  This is a signal worth a second look, not proof the original review missed something.
                </li>
              </ul>
            </div>
          </div>

          <div className="ai-insight-section">
            {aiText === null && !aiLoading && (
              <button className="btn-secondary ai-insight-btn" onClick={handleGenerateAI}>
                <Sparkles size={14} /> Generate AI Interpretation
              </button>
            )}
            {aiLoading && <div className="loading-state"><span className="loading-dot" /> Asking the local LLM to interpret this evidence...</div>}
            {aiError && (
              <div className="error-banner">
                {aiError}
                <button className="ai-retry-btn" onClick={handleGenerateAI}>Retry</button>
              </div>
            )}
            {aiText !== null && !aiLoading && (
              <div className="ai-insight-card">
                <div className="ai-insight-label"><Sparkles size={13} /> AI Interpretation</div>
                <p className="ai-insight-text">{aiText}</p>
                <p className="ai-insight-caveat">
                  Generated by a local LLM (DeepSeek via Ollama), grounded only in the Observed/Classified/Signal
                  evidence above. This is an interpretation, not additional evidence.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
