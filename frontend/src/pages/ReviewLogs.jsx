import React, { useState, useEffect } from 'react';
import { Terminal, Clock, AlertCircle } from 'lucide-react';
import { reviewApi } from '../api';

export function ReviewLogs() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewApi.listReviews().then(data => {
      setReviews(data);
      setLoading(false);
    });
  }, []);

  return (
    <section className="content-area">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Reviewer Logs</h2>
          <p className="page-subtitle">Raw execution history and system analysis logs</p>
        </div>
      </div>

      <div className="reviews-list-container glass animate-fade-in" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
          <div className="flex items-center gap-2 text-muted">
            <Terminal size={16} />
            <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>SYSTEM_STDOUT</span>
          </div>
        </div>
        
        <div className="logs-container" style={{ padding: '20px', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}>
          {reviews.map((review, i) => (
            <div key={review.id} className="log-entry" style={{ marginBottom: '12px', display: 'flex', gap: '15px' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', minWidth: '150px' }}>
                [{new Date(review.createdAt).toISOString()}]
              </span>
              <span style={{ color: review.status === 'COMPLETED' ? '#4ade80' : '#f87171', fontWeight: 'bold', minWidth: '80px' }}>
                {review.status}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                Analysis completed for {review.repoName} PR#{review.prNumber}: "{review.prTitle}"
              </span>
            </div>
          ))}
          {loading && <div style={{ color: 'rgba(255,255,255,0.5)' }}>Loading system logs...</div>}
          {!loading && reviews.length === 0 && <div style={{ color: 'rgba(255,255,255,0.5)' }}>No logs available.</div>}
        </div>
      </div>
    </section>
  );
}
