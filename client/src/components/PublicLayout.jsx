import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './PublicLayout.css';

export default function PublicLayout() {
  return (
    <div className="public-layout-wrapper">
      
      {/* Header - Kept exactly the same, but CSS handles the spacing fix */}
      <header className="public-topbar">
        <nav className="public-nav">
          <Link to="/" className="public-logo">DevPulse</Link>
          <div className="public-nav-actions">
            <Link to="/login" className="btn-outline">Log In</Link>
            <Link to="/register" className="btn-primary">Sign Up</Link>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="public-main">
        <Outlet />
      </main>

      {/* New Centered Footer Structure */}
      <footer className="public-footer">
        <div className="footer-content">
          <div className="footer-logo">DevPulse</div>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/support">Support</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <p className="footer-copyright">© {new Date().getFullYear()} DevPulse Editorial. All rights reserved.</p>
        </div>
      </footer>
      
    </div>
  );
}