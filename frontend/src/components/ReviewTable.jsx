import React from 'react';
import { GitPullRequest, CheckCircle2, XCircle, Clock, RefreshCcw, ChevronRight } from 'lucide-react';

export function ReviewTable({ reviews, onInspect }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={16} />;
      case 'FAILED': return <XCircle size={16} />;
      case 'PROCESSING': return <RefreshCcw className="animate-spin" size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="reviews-list-container glass animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <table className="reviews-table">
        <thead>
          <tr>
            <th>Repository</th>
            <th>Pull Request</th>
            <th>Intelligence Status</th>
            <th>Detected</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id} className="review-row">
              <td>
                <div className="repo-info">
                  <GitPullRequest size={14} className="text-muted" />
                  <span className="repo-name">{review.repoName}</span>
                </div>
              </td>
              <td>
                <div className="pr-info">
                  <span className="pr-title">{review.prTitle}</span>
                  <span className="pr-meta">#{review.prNumber} • by @{review.author}</span>
                </div>
              </td>
              <td>
                <div className={`status-badge status-${review.status.toLowerCase()}`}>
                  {getStatusIcon(review.status)}
                  <span>{review.status}</span>
                </div>
              </td>
              <td>
                <span className="date-text">
                  {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </td>
              <td>
                <button 
                  className="btn-view"
                  onClick={() => onInspect(review)}
                >
                  Inspect
                  <ChevronRight size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
