import React, { useState } from 'react';
import { X, Code, RefreshCcw, CheckCircle2, Loader2 } from 'lucide-react';
import { reviewApi } from '../api';

export function IntelligencePanel({ review, onClose }) {
  const [applyingId, setApplyingId] = useState(null);
  const [ignoringId, setIgnoringId] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set(
    review?.issues.filter(i => i.isApplied).map(i => i.id) || []
  ));
  const [ignoredIds, setIgnoredIds] = useState(new Set(
    review?.issues.filter(i => i.isIgnored).map(i => i.id) || []
  ));

  if (!review) return null;

  const handleApply = async (issue) => {
    try {
      setApplyingId(issue.id);
      await reviewApi.applySuggestion(review.id, issue.commentId);
      setAppliedIds(prev => new Set(prev).add(issue.id));
    } catch (err) {
      console.error('Failed to apply suggestion:', err);
      alert('Failed to post comment to GitHub.');
    } finally {
      setApplyingId(null);
    }
  };

  const handleIgnore = async (issue) => {
    try {
      setIgnoringId(issue.id);
      await reviewApi.ignoreSuggestion(review.id, issue.commentId);
      setIgnoredIds(prev => new Set(prev).add(issue.id));
    } catch (err) {
      console.error('Failed to ignore suggestion:', err);
      alert('Failed to ignore suggestion.');
    } finally {
      setIgnoringId(null);
    }
  };

  return (
    <div className="intelligence-panel-overlay" onClick={onClose}>
      <div className="intelligence-panel" onClick={(e) => e.stopPropagation()}>
        <header className="panel-header">
          <h3>PR Intelligence</h3>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        
        <div className="panel-content">
          <div className="panel-meta">
            <h4 className="pr-title">{review.prTitle}</h4>
            <p className="pr-meta">{review.repoName} #{review.prNumber}</p>
          </div>

          {review.status === 'PROCESSING' ? (
            <div className="processing-state animate-fade-in">
              <RefreshCcw className="animate-spin icon-primary" size={48} />
              <p>AI is scanning your code...</p>
            </div>
          ) : review.issues && review.issues.length > 0 ? (
            review.issues.map((issue, index) => (
              <div 
                key={issue.id} 
                className={`issue-card ${ignoredIds.has(issue.id) ? 'ignored-card' : ''}`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  opacity: ignoredIds.has(issue.id) ? 0.5 : 1
                }}
              >
                <div className="issue-header">
                  <span className={`issue-severity severity-${issue.severity.toLowerCase()}`}>
                    {issue.severity}
                  </span>
                  <div className="issue-file">
                    <Code size={14} />
                    <span>{issue.file}:L{issue.line}</span>
                  </div>
                </div>
                <h4 className="issue-title">{issue.title}</h4>
                <p className="issue-description">{issue.description}</p>
                
                {!ignoredIds.has(issue.id) && (
                  <>
                    <div className="code-block">
                      <div className="code-header">Current Implementation</div>
                      <pre><code>{issue.code}</code></pre>
                    </div>

                    <div className="code-block">
                      <div className="code-header">Suggested Fix</div>
                      <pre><code>{issue.suggestion}</code></pre>
                    </div>
                  </>
                )}

                <div className="suggestion-actions">
                  {!ignoredIds.has(issue.id) ? (
                    <>
                      <button 
                        className="btn-primary" 
                        onClick={() => handleApply(issue)}
                        disabled={applyingId === issue.id || appliedIds.has(issue.id)}
                      >
                        {applyingId === issue.id ? (
                          <><Loader2 size={14} className="animate-spin" /> Applying...</>
                        ) : appliedIds.has(issue.id) ? (
                          <><CheckCircle2 size={14} /> Applied to GitHub</>
                        ) : (
                          'Apply Suggestion'
                        )}
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={() => handleIgnore(issue)}
                        disabled={ignoringId === issue.id || appliedIds.has(issue.id)}
                      >
                        {ignoringId === issue.id ? 'Ignoring...' : 'Ignore'}
                      </button>
                    </>
                  ) : (
                    <span className="text-muted" style={{ fontSize: '13px' }}>This suggestion was dismissed.</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state animate-fade-in">
              <CheckCircle2 className="text-success" size={48} />
              <p>No critical issues detected. High code quality!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
