import React from 'react';

export function StatsGrid({ stats }) {
  const successRate = stats.totalReviews > 0 
    ? (((stats.totalReviews - stats.failedReviews) / stats.totalReviews) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="stats-grid">
      <div className="stat-card glass animate-fade-in">
        <span className="stat-label">Total Analyzed</span>
        <span className="stat-value">{stats.totalReviews.toLocaleString()}</span>
      </div>
      <div className="stat-card glass animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <span className="stat-label">Success Rate</span>
        <span className="stat-value text-success">{successRate}%</span>
      </div>
      <div className="stat-card glass animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <span className="stat-label">Critical Issues</span>
        <span className="stat-value text-danger">{stats.failedReviews}</span>
      </div>
    </div>
  );
}
