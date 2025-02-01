import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Page1 from './pages/Page1';
import Page3 from './pages/Page3';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/page1" element={<Page1 />} />
        <Route path="/page3" element={<Page3 />} />
        <Route path="/" element={<Navigate to="/page1" replace />} />
      </Routes>
    </Router>
  );
}

export default App;