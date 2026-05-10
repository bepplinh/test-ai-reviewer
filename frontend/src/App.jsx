import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Repositories } from './pages/Repositories';
import { ReviewLogs } from './pages/ReviewLogs';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}>
          <Route path="/" element={<Dashboard searchTerm={searchTerm} />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/logs" element={<ReviewLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
