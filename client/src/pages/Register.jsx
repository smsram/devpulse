import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Toast from '../components/ui/Toast';
import ConfirmAlert from '../components/ui/ConfirmAlert';
import Loader from '../components/ui/Loader';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  // Changed githubUsername to username
  const [formData, setFormData] = useState({ name: '', email: '', username: '', password: '' });
  const [toast, setToast] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerRegistration = (e) => {
    e.preventDefault();
    setShowAlert(true);
  };

  const executeRegistration = async () => {
    setShowAlert(false);
    setLoading(true);
    
    try {
      const res = await API.post('/auth/register', formData);
      localStorage.setItem('devpulse_token', res.data.token);
      setToast({ message: 'Account created successfully!', type: 'success' });
      
      setTimeout(() => {
        // Redirects to /app/their_chosen_username
        navigate(`/app/${res.data.username}`); 
      }, 1000);
    } catch (err) {
      setLoading(false);
      setToast({ 
        message: err.response?.data?.msg || 'Failed to create account. Please check your details.', 
        type: 'error' 
      });
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="register-page">
        {showAlert && (
          <ConfirmAlert 
            title="Create Account"
            message={`Are you sure you want to register? Your profile URL will be devpulse.com/app/${formData.username.trim().toLowerCase().replace(/\s+/g, '')}.`}
            okText="Create Account"
            cancelText="Go Back"
            onConfirm={executeRegistration}
            onCancel={() => setShowAlert(false)}
          />
        )}

        <header className="register-header">
          <div className="register-nav-container">
            <Link to="/" className="register-logo">
              <span className="logo-text">DevPulse</span>
            </Link>
          </div>
        </header>

        <main className="register-main">
          <div className="register-card-wrapper">
            <div className="register-card">
              <div className="card-intro">
                <h1 className="card-title">Create your account.</h1>
                <p className="card-subtitle">Join the elite network of engineers building the future.</p>
              </div>

              <form className="register-form" onSubmit={triggerRegistration}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    placeholder="Alex Rivera"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="alex@devpulse.io"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">App Username</label>
                  <div className="github-input-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-container-low)', borderRadius: '0.5rem', padding: '0 1rem', border: '1px solid transparent', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--outline)', whiteSpace: 'nowrap' }}>devpulse.com/app/</span>
                    <input 
                      type="text" 
                      id="username" 
                      placeholder="alexrivera"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required 
                      disabled={loading}
                      style={{ flex: 1, background: 'transparent', border: 'none', padding: '0.75rem 0.5rem', boxShadow: 'none' }}
                      // Basic client-side validation pattern (no spaces)
                      pattern="^\S+$"
                      title="Username cannot contain spaces"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input 
                    type="password" 
                    id="password" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required 
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="btn-register" disabled={loading}>
                  {loading ? (
                    <Loader size="20px" color="#ffffff" />
                  ) : (
                    <>
                      Create Account
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <div className="card-footer">
                <p>
                  Already have an account? 
                  <Link to="/login" className="login-link">Login</Link>
                </p>
              </div>
            </div>

            <div className="security-insight-card">
              <div className="security-icon-box">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div className="security-text">
                <p className="security-title">Enterprise Grade Security</p>
                <p className="security-desc">SOC2 compliant data encryption by default.</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="register-footer">
          {/* Footer content unchanged */}
        </footer>
      </div>
    </>
  );
}