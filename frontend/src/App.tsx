import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hammer, User, Settings } from 'lucide-react';
import './App.css'; // Just keeping it if specific app styles are needed, but we rely heavily on index.css

import Auth from './pages/Auth';

function App() {
  const token = localStorage.getItem('token'); // Basic auth state check for UI

  return (
    <div className="app-container">
      {/* Premium Glass Top Navigation */}
      <nav className="glass-panel main-nav">
        <Link to="/" className="logo-area">
          <div className="logo-icon">
            <Hammer size={24} color="#0b0c10" />
          </div>
          <h1>Handrix</h1>
        </Link>
        
        <div className="nav-links">
          <Link to="/portal" className="nav-link">
            <User size={18} />
            Handyman Portal
          </Link>
          {!token ? (
            <Link to="/auth" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
              Sign In
            </Link>
          ) : (
            <button className="nav-link" onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} style={{ background: 'none', border:'none', cursor:'pointer' }}>
              Logout
            </button>
          )}
        </div>
      </nav>

      <main className="content-area">
        <Routes>
          <Route path="/" element={<ClientHome />} />
          <Route path="/portal" element={<PortalHome />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </div>
  );
}

// Quick Placeholder: Client Landing
function ClientHome() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="view-container"
    >
      <div className="landing-hero glass-panel">
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Home repairs, <span style={{ color: 'var(--primary-accent)' }}>on demand.</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>
          Tell us what's broken in the chat, and a certified professional will be at your door in an hour.
        </p>
        
        <button className="btn-primary" onClick={() => alert("We'll implement the AI Chat next!")}>
          Describe your problem
        </button>
      </div>
    </motion.div>
  );
}

// Quick Placeholder: Handyman Portal
function PortalHome() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="view-container"
    >
      <div className="portal-hero glass-panel">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Handyman Portal</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Toggle your availability and wait for the dispatch system to ping you.
        </p>
      </div>
    </motion.div>
  );
}

export default App;
