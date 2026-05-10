import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export function Layout({ searchTerm, setSearchTerm }) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <TopHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Outlet />
      </main>
    </div>
  );
}
