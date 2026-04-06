import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ChevronRight, Hammer } from 'lucide-react';
import api from '../Api';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'handyman'>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login API Call
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.access_token);
        
        // Quick role check from token or assume client
        navigate('/');
      } else {
        // Register API Call
        const res = await api.post('/auth/register', { 
          email, 
          password, 
          role,
          isHandyman: role === 'handyman' 
        });
        
        // Auto-login after register
        const loginRes = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', loginRes.data.access_token);
        
        navigate(role === 'handyman' ? '/portal' : '/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="auth-wrapper"
    >
      <div className="auth-box glass-panel">
        <div className="auth-header">
          <div className="logo-icon">
            <Hammer size={24} color="#0b0c10" />
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Join Handrix'}</h2>
          <p>{isLogin ? 'Sign in to request or manage home services.' : 'Create an account to get started.'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {!isLogin && (
            <div className="role-selector">
              <p>I am a:</p>
              <div className="role-buttons">
                <button 
                  type="button" 
                  className={`role-btn ${role === 'client' ? 'active' : ''}`}
                  onClick={() => setRole('client')}
                >
                  <User size={16} /> Client
                </button>
                <button 
                  type="button" 
                  className={`role-btn ${role === 'handyman' ? 'active' : ''}`}
                  onClick={() => setRole('handyman')}
                >
                  <Hammer size={16} /> Handyman
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>

        <div className="google-oauth-stub">
          <button className="btn-google" type="button" onClick={() => alert("Google OAuth is deferred as per roadmap step 2.2!")}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" />
            Continue with Google
          </button>
        </div>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
