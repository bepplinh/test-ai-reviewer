import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { StatsGrid } from '../components/StatsGrid';
import { ReviewTable } from '../components/ReviewTable';
import { IntelligencePanel } from '../components/IntelligencePanel';
import { reviewApi } from '../api';

export function Dashboard({ searchTerm }) {
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, failedReviews: 0, totalTokens: 0, totalCostUsd: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewApi.listReviews(),
        reviewApi.getStats()
      ]);
      setReviews(reviewsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Could not connect to the intelligence server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInspect = async (review) => {
    try {
      const detail = await reviewApi.getReviewDetail(review.id);
      setSelectedReview(detail);
    } catch (err) {
      console.error('Failed to fetch review detail:', err);
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.repoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.prTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="content-area">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Intelligence Overview</h2>
          <p className="page-subtitle">AI-driven code analysis for your active pull requests</p>
        </div>
        <button className="btn-refresh" onClick={fetchData} disabled={loading}>
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {error ? (
        <div className="error-state glass">
          <p>{error}</p>
          <button onClick={fetchData}>Try Again</button>
        </div>
      ) : (
        <>
          <StatsGrid stats={stats} />
          <ReviewTable 
            reviews={filteredReviews} 
            onInspect={handleInspect} 
          />
        </>
      )}

      <IntelligencePanel 
        review={selectedReview} 
        onClose={() => setSelectedReview(null)} 
      />
    </section>
  );
}
