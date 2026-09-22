import { useState } from 'react'
import { Code2, Terminal } from 'lucide-react'
import { scoreComment, evaluateCommitMessage } from '../utils/classifierRules'

const COMMENT_SAMPLES = {
  lgtm: 'LGTM! Looks good to merge.',
  technical: "This doesn't handle the case where the token has already expired before the retry - can you add a check for that before calling refresh()?"
}

const COMMIT_SAMPLES = {
  hotfix: 'fix: resolve NullPointerException in auth token validator',
  chore: 'docs: update README formatting'
}

export default function RulesPlaygroundPage() {
  const [comment, setComment] = useState(COMMENT_SAMPLES.lgtm)
  const [commitMsg, setCommitMsg] = useState(COMMIT_SAMPLES.hotfix)

  const scoreResult = scoreComment(comment)
  const fixResult = evaluateCommitMessage(commitMsg)

  return (
    <div className="page-header">
      <div className="page-eyebrow">Interactive Rules &amp; Heuristics Simulator</div>
      <h1>Explainable Classifier Playground</h1>
      <p className="page-subtitle">
        Simulate how Candor's deterministic rule engine scores review comments and detects
        post-merge bug-fix commits, with a transparent, real breakdown — no fabricated confidence
        scores. These are the exact same rules used by the backend classifier.
      </p>

      <div className="playground-grid">
        <div className="playground-panel">
          <div className="playground-panel-header">
            <span className="playground-panel-title"><Code2 size={15} /> Review Comment Substance Evaluator</span>
            <span className={`badge ${scoreResult.label}`}>{scoreResult.label}</span>
          </div>

          <label className="playground-label">Input review comment</label>
          <textarea className="playground-textarea" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />

          <div className="playground-samples">
            <button onClick={() => setComment(COMMENT_SAMPLES.lgtm)}>Sample: "LGTM"</button>
            <button onClick={() => setComment(COMMENT_SAMPLES.technical)}>Sample: Deep Technical</button>
          </div>

          <div className="score-bar-row">
            <span>Deterministic Substance Score</span>
            <span className="score-bar-value">{scoreResult.score} / 100</span>
          </div>
          <div className="score-bar-track">
            <div
              className={`score-bar-fill ${scoreResult.score >= 50 ? 'good' : 'bad'}`}
              style={{ width: `${scoreResult.score}%` }}
            />
          </div>

          <div className="playground-breakdown-title">Audit breakdown ({scoreResult.breakdown.length} signals)</div>
          <div className="playground-breakdown">
            {scoreResult.breakdown.map((item, i) => (
              <div className="breakdown-row" key={i}>
                <span className="breakdown-dot" />
                <span className="breakdown-label">{item.label}</span>
                <span className={`breakdown-points ${item.points < 0 ? 'neg' : item.points > 0 ? 'pos' : ''}`}>
                  {item.points > 0 ? '+' : ''}{item.points}pts
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="playground-panel">
          <div className="playground-panel-header">
            <span className="playground-panel-title"><Terminal size={15} /> Post-Merge Bug-Fix Commit Evaluator</span>
            <span className={`badge ${fixResult.matched ? 'SUPERFICIAL' : 'NONE'}`}>
              {fixResult.matched ? 'FIX DETECTED' : 'NO MATCH'}
            </span>
          </div>

          <label className="playground-label">Input commit message</label>
          <textarea className="playground-textarea" value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)} rows={4} />

          <div className="playground-samples">
            <button onClick={() => setCommitMsg(COMMIT_SAMPLES.hotfix)}>Sample: Hotfix</button>
            <button onClick={() => setCommitMsg(COMMIT_SAMPLES.chore)}>Sample: Docs / Chore</button>
          </div>

          <div className="score-bar-row">
            <span>Keyword Match Strength</span>
          </div>
          <div className="keyword-strength-box">
            {fixResult.strength}
          </div>

          <div className="playground-breakdown-title">Pattern match analysis</div>
          <div className="playground-breakdown">
            <div className="breakdown-row">
              <span className="breakdown-dot" />
              <span className="breakdown-label">
                {fixResult.matched
                  ? `Matched fix-related keyword: "${fixResult.keyword}"`
                  : 'No fix-related keyword (fix, bug, hotfix, patch, revert, regression) found'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
