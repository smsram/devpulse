import React from 'react';
import { Link } from 'react-router-dom';
import './Terms.css';

export default function Terms() {
  const handleDownload = () => {
    window.print(); // Best way for users to "Save as PDF" with styles
  };

  return (
    <div className="legal-wrapper animate-fade-in">
      <div className="legal-container">
        
        {/* Navigation & Badge */}
        <div className="legal-meta">
          <Link to="/" className="legal-back-link">
            <span className="material-symbols-outlined">chevron_left</span>
            Back to Home
          </Link>
          <span className="legal-badge">Last Updated: March 2026</span>
        </div>

        <article className="legal-card">
          <header className="legal-header">
            <h1 className="legal-title">Terms of Service</h1>
            <p className="legal-subtitle">
              Please read these terms carefully before using the DevPulse platform. By accessing our services, you agree to be bound by these standards.
            </p>
          </header>

          {/* TL;DR Box */}
          <div className="legal-tldr">
            <div className="tldr-header">
              <span className="material-symbols-outlined">info</span>
              <h3>TL;DR — Plain English Summary</h3>
            </div>
            <ul className="tldr-list">
              <li><span>•</span> We own the platform, you own your data and code inputs.</li>
              <li><span>•</span> Don't use DevPulse for illegal activities or to break our systems.</li>
              <li><span>•</span> We provide the service "as is"—we aim for 99.9% uptime.</li>
              <li><span>•</span> You can cancel your subscription at any time through settings.</li>
            </ul>
          </div>

          {/* Document Content */}
          <div className="legal-content">
            <section className="legal-section">
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing or using the DevPulse platform ("Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
              <p>These terms apply to all visitors, users, and others who access or use the Service.</p>
            </section>

            <section className="legal-section">
              <h2>2. User Conduct</h2>
              <p>You are responsible for all activity that occurs under your account. You agree not to engage in prohibited activities such as:</p>
              <ul>
                <li>Copying, distributing, or disclosing any part of the Service in any medium.</li>
                <li>Using any automated system, including "robots" or "spiders," to access the Service.</li>
                <li>Attempting to interfere with system integrity or decipher transmissions to our servers.</li>
                <li>Imposing an unreasonable load on our infrastructure.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. Intellectual Property</h2>
              <p>The Service and its original content, features, and functionality remain the exclusive property of DevPulse. Your own data and project links remain your property.</p>
            </section>

            <section className="legal-section">
              <h2>4. Termination</h2>
              <p>We may terminate or suspend your account immediately, without prior notice, if you breach the Terms. You may discontinue use at any time.</p>
            </section>

            <section className="legal-section">
              <h2>5. Limitation of Liability</h2>
              <p>In no event shall DevPulse be liable for any indirect, incidental, special, or consequential damages resulting from your access to or use of the Service.</p>
            </section>
          </div>

          {/* Bottom Actions */}
          <footer className="legal-footer-actions">
            <p>Still have questions? <Link to="/support">Contact Legal Support</Link></p>
            <div className="legal-buttons">
              <button className="btn-outline" onClick={handleDownload}>
                <span className="material-symbols-outlined">download</span> Download PDF
              </button>
              <Link to="/register" className="btn-primary">I Accept Terms</Link>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}