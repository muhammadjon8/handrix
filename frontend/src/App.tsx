import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hammer, User, History } from 'lucide-react';
import './App.css'; // Just keeping it if specific app styles are needed, but we rely heavily on index.css

import Auth from './pages/Auth';
import AiChat from './components/AiChat';
import JobHistory from './components/JobHistory';

function App() {
  const token = localStorage.getItem('token');
  
  let userRole = null;
  if(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch(e) {}
  }

  const isHandyman = userRole === 'handyman';
  const isClient = userRole === 'client';

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
          {token && (
            <Link to={isHandyman ? "/portal/history" : "/client/history"} className="nav-link font-medium">
              <History size={18} />
              {isHandyman ? 'Earnings' : 'History'}
            </Link>
          )}

          {isHandyman && (
            <Link to="/portal" className="nav-link font-medium">
              <User size={18} />
              Portal
            </Link>
          )}

          {!token ? (
            <Link to="/auth" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
              Sign In
            </Link>
          ) : (
            <button className="nav-link text-red-400 font-medium whitespace-nowrap" onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }} style={{ background: 'none', border:'none', cursor:'pointer' }}>
              Logout
            </button>
          )}
        </div>
      </nav>

      <main className="content-area">
        <Routes>
          {/* Landing / Client Flow */}
          <Route path="/" element={
            !token ? <Auth /> : 
            isHandyman ? <HandymanPortal /> : 
            <ClientHome />
          } />

          {/* Explicit Handyman Route */}
          <Route path="/portal" element={
            isHandyman ? <HandymanPortal /> : <Auth />
          } />

          {/* History Views */}
          <Route path="/client/history" element={
            isClient ? <div className="view-container w-full"><JobHistory role="client" /></div> : <Auth />
          } />
          <Route path="/portal/history" element={
            isHandyman ? <div className="view-container w-full"><JobHistory role="handyman" /></div> : <Auth />
          } />

          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </div>
  );
}

import JobConfirmation from './components/JobConfirmation';
import ActiveJobTracker from './components/ActiveJobTracker';

// Quick Placeholder: Client Landing
function ClientHome() {
  const [chatActive, setChatActive] = useState(false);
  const [jobData, setJobData] = useState<any>(null);
  const [bookedJobId, setBookedJobId] = useState<number | null>(null);

  const handleJobClassified = (data: any, location: { lat: number, lng: number, address: string }) => {
    setJobData({ ...data, location });
  };

  const handleBookingComplete = (jobResponse: any) => {
    // Booking successful, proceed to the socket tracking view!
    setBookedJobId(jobResponse.id);
    setJobData(null);
  };

  if (bookedJobId) {
    return (
      <div className="view-container items-center py-10 w-full">
         <ActiveJobTracker jobId={bookedJobId} />
      </div>
    );
  }

  if (jobData) {
    return (
      <div className="view-container items-center py-10">
         <JobConfirmation 
           jobData={jobData} 
           onBookingComplete={handleBookingComplete} 
           onCancel={() => {
             setJobData(null);
             setChatActive(false);
           }} 
         />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="view-container items-center"
    >
      {!chatActive ? (
        <div className="landing-hero glass-panel max-w-3xl">
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }} className="font-display">
            Home repairs, <span className="text-primary-accent">on demand.</span>
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            Tell us what's broken in the chat, and a certified professional will be at your door in an hour.
          </p>
          
          <button className="btn-primary" onClick={() => setChatActive(true)}>
            Describe your problem
          </button>
        </div>
      ) : (
        <AiChat onJobClassified={handleJobClassified} />
      )}
    </motion.div>
  );
}

import HandymanPortal from './pages/HandymanPortal';

export default App;
