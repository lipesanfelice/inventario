import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Sectors from './pages/Sectors';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Desktop Sidebar - Oculto na impressão */}
        <div className="print:hidden">
          <Sidebar />
        </div>
        
        <main className="flex-1 md:ml-64 flex flex-col print:ml-0 print:w-full">
          {/* Mobile Nav - Oculto na impressão */}
          <div className="print:hidden">
             <MobileNav />
          </div>

          <div className="p-6 md:p-8 flex-1 overflow-auto print:p-0 print:overflow-visible">
             <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/sectors" element={<Sectors />} />
             </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;