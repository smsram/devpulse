import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Toast from '../components/ui/Toast';
import Loader from '../components/ui/Loader';
import ConfirmAlert from '../components/ui/ConfirmAlert'; // Import ConfirmAlert
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [toast, setToast] = useState(null);
  
  // Loading & Flow States
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Checks session on mount
  
  // Existing Session State
  const [existingUser, setExistingUser] = useState(null);
  const [showAutoLoginAlert, setShowAutoLoginAlert] = useState(false);

  // --- Session Check on Mount ---
  useEffect(() => {
    const checkExistingSession = async () => {
      const token = localStorage.getItem('devpulse_token');
      
      if (!token) {
        setPageLoading(false);
        return; // No token, proceed to normal login
      }

      try {
        // Verify the token is actually valid
        const res = await API.get('/auth/me');
        if (res.data && res.data.username) {
          setExistingUser(res.data);
          setShowAutoLoginAlert(true); // Trigger the alert
        } else {
          // Token is present but invalid/expired
          localStorage.removeItem('devpulse_token');
        }
      } catch (err) {
        // Token verification failed (e.g., expired)
        localStorage.removeItem('devpulse_token');
      } finally {
        setPageLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // --- Handlers for the Auto-Login Alert ---
  const handleProceedToDashboard = () => {
    navigate(`/app/${existingUser.username}`);
  };

  const handleStayAndLogout = () => {
    // User wants to log into a different account
    localStorage.removeItem('devpulse_token');
    setExistingUser(null);
    setShowAutoLoginAlert(false);
    setToast({ message: 'Previous session cleared. Please log in.', type: 'info' });
  };

  // --- Standard Login Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/auth/login', formData);
      
      localStorage.setItem('devpulse_token', res.data.token);
      setToast({ message: 'Welcome back, Engineer!', type: 'success' });
      
      setTimeout(() => {
        navigate(`/app/${res.data.username}`);
      }, 1500);
    } catch (err) {
      setLoading(false);
      setToast({ 
        message: err.response?.data?.msg || 'Login failed. Please check your credentials.', 
        type: 'error' 
      });
    }
  };

  // Show a full page loader while checking the initial session
  if (pageLoading) {
    return <Loader fullPage size="48px" color="var(--primary)" />;
  }

  return (
    <div className="login-page">
      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Auto-Login Confirmation Alert */}
      {showAutoLoginAlert && existingUser && (
        <ConfirmAlert 
          title="Active Session Found"
          message={`You are already logged in as ${existingUser.name || existingUser.username}. Would you like to proceed to your dashboard?`}
          okText="Go to Dashboard"
          cancelText="Switch Account"
          onConfirm={handleProceedToDashboard}
          onCancel={handleStayAndLogout}
        />
      )}
      
      <header className="login-header">
        <div className="login-container">
          <Link to="/" className="login-logo">
            <div className="logo-box">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <span className="logo-text">DevPulse</span>
          </Link>
        </div>
      </header>

      <main className="login-main">
        <div className="ambient-glow"></div>
        
        <div className="login-card-wrapper animate-fade-in">
          <div className="login-card">
            <div className="card-intro">
              <h1 className="card-title">Sign in to DevPulse.</h1>
              <p className="card-subtitle">
                Welcome back, engineer. Enter your credentials to access your dashboard.
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="name@company.com" 
                  value={formData.email}
                  autoComplete="email"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                  disabled={loading || showAutoLoginAlert}
                />
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  <a href="#" className="forgot-link">Forgot Password?</a>
                </div>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  autoComplete="current-password"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                  disabled={loading || showAutoLoginAlert}
                />
              </div>

              <button type="submit" className="btn-signin" disabled={loading || showAutoLoginAlert}>
                {loading ? (
                  <Loader size="18px" color="#ffffff" />
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="card-footer">
              <p>
                Don't have an account? 
                <Link to="/register" className="signup-link">Sign Up</Link>
              </p>
            </div>
          </div>

          <footer className="login-footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/support">System Status</Link>
          </footer>
        </div>
      </main>
    </div>
  );
}