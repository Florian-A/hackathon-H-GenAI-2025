import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Resultats from './pages/Resultats';
import AnalysisResults from './pages/AnalysisResults';
import Analysis from './pages/Analysis';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/resultats" element={<Resultats />} />
            <Route path="/analysis-results" element={<AnalysisResults />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;