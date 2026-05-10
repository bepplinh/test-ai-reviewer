import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, GitPullRequest, Terminal, Zap } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo-section">
        <div className="logo-icon">
          <Zap size={20} color="#fff" fill="#fff" />
        </div>
        <h1>COMMAND</h1>
      </div>
      
      <nav className="nav-menu">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end
        >
          <Layout size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/repositories" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <GitPullRequest size={20} />
          <span>Repositories</span>
        </NavLink>
        <NavLink 
          to="/logs" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Terminal size={20} />
          <span>Review Logs</span>
        </NavLink>
      </nav>
    </aside>
  );
}
