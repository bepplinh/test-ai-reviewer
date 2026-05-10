import React from 'react';
import { Search } from 'lucide-react';

export function TopHeader({ searchTerm, setSearchTerm }) {
  return (
    <header className="top-header">
      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search (Cmd + K)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="user-profile">
        <div className="avatar">AD</div>
      </div>
    </header>
  );
}
