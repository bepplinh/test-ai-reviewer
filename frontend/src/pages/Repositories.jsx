import React, { useState, useEffect } from 'react';
import { GitBranch, ExternalLink, Search } from 'lucide-react';
import axios from 'axios';

export function Repositories() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd have an endpoint for this. 
    // For now, we'll derive it from Pull Requests or just show a nice placeholder.
    const fetchRepos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/pull-requests');
        // Extract unique repos
        const uniqueRepos = [...new Set(response.data.map(pr => pr.repoName))].map(name => ({
          name,
          owner: response.data.find(pr => pr.repoName === name).repoOwner,
          url: response.data.find(pr => pr.repoName === name).githubUrl.split('/pull/')[0]
        }));
        setRepos(uniqueRepos);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  return (
    <section className="content-area">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Monitored Repositories</h2>
          <p className="page-subtitle">Manage codebases currently under AI supervision</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass">
          <span className="stat-label">Connected Repos</span>
          <span className="stat-value">{repos.length}</span>
        </div>
      </div>

      <div className="reviews-list-container glass animate-fade-in">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>Repository Name</th>
              <th>Owner</th>
              <th>Source</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {repos.map((repo, i) => (
              <tr key={i} className="review-row">
                <td>
                  <div className="repo-info">
                    <GitBranch size={16} className="text-primary" />
                    <span className="repo-name">{repo.name}</span>
                  </div>
                </td>
                <td>@{repo.owner}</td>
                <td>
                  <a href={repo.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-muted hover:text-primary">
                    GitHub <ExternalLink size={12} />
                  </a>
                </td>
                <td>
                  <button className="btn-view">Configure</button>
                </td>
              </tr>
            ))}
            {repos.length === 0 && !loading && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                  No repositories found. Connect a repository via Webhook to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
