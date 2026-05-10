import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const reviewApi = {
  getStats: async () => {
    const response = await api.get('/reviews/stats');
    return response.data;
  },
  
  listReviews: async () => {
    const response = await api.get('/reviews');
    // Map backend structure to frontend structure
    return response.data.map(review => ({
      id: review.id,
      repoName: review.pullRequest.repoName,
      prNumber: review.pullRequest.prNumber,
      prTitle: review.pullRequest.prTitle,
      author: review.pullRequest.author,
      status: review.status,
      createdAt: review.createdAt,
      // Issues are only in the detail view
      issues: []
    }));
  },
  
  getReviewDetail: async (id) => {
    const response = await api.get(`/reviews/${id}`);
    const data = response.data;
    return {
      ...data,
      repoName: data.repository, // Backend returns repository
      issues: data.issues.map((issue) => ({
        id: issue.id || `iss-${Math.random().toString(36).substr(2, 9)}`, 
        title: issue.type,
        severity: issue.severity,
        description: issue.message,
        file: issue.filePath,
        line: issue.line,
        code: "// Original code snippet not available", 
        suggestion: issue.suggestion,
        commentId: issue.id,
        isIgnored: issue.isIgnored,
        isApplied: issue.isApplied
      }))
    };
  },
  
  applySuggestion: async (reviewId, commentId) => {
    const response = await api.post(`/reviews/${reviewId}/comments/${commentId}/apply`);
    return response.data;
  },

  ignoreSuggestion: async (reviewId, commentId) => {
    const response = await api.post(`/reviews/${reviewId}/comments/${commentId}/ignore`);
    return response.data;
  }
};
