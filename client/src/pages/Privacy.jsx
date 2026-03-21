import React from 'react';
import { Link } from 'react-router-dom';
import './Privacy.css';

export default function Privacy() {
  const handleDownload = () => {
    window.print();
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
          <div className="legal-status-badge">
            <span className="status-dot-active"></span>
            Last Updated: June 15, 2024
          </div>
        </div>

        <article className="legal-card">
          <header className="legal-header">
            <h1 className="legal-title">Privacy Pulse</h1>
            <p className="legal-subtitle">
              At DevPulse, we believe engineering excellence requires transparency. We only request the data necessary to provide meaningful technical insights.
            </p>
          </header>

          {/* PDF Download FAB */}
          <div className="legal-actions-top">
            <button className="btn-outline btn-sm" onClick={handleDownload}>
              <span className="material-symbols-outlined">download</span> Download PDF
            </button>
          </div>

          {/* Transparency Grid: Quick Facts */}
          <div className="transparency-grid">
            <div className="transparency-card tracking">
              <h3><span className="material-symbols-outlined">visibility</span> What we track</h3>
              <ul>
                <li><span className="material-symbols-outlined">hub</span> GitHub public repository metadata</li>
                <li><span className="material-symbols-outlined">account_circle</span> Public profile name & avatar</li>
                <li><span className="material-symbols-outlined">insights</span> Aggregated site usage analytics</li>
              </ul>
            </div>
            <div className="transparency-card private">
              <h3><span className="material-symbols-outlined">visibility_off</span> What we never see</h3>
              <ul>
                <li><span className="material-symbols-outlined">key</span> Your GitHub or local passwords</li>
                <li><span className="material-symbols-outlined">lock</span> Private repository code or data</li>
                <li><span className="material-symbols-outlined">credit_card</span> Credit card or payment credentials</li>
              </ul>
            </div>
          </div>

          <div className="legal-content">
            <section className="legal-section">
              <h2>Engineering Privacy by Design</h2>
              <p>Our platform is built on the principle of least privilege. We minimize data footprint by stripping sensitive identifiers from GitHub payloads before they hit our processing engine.</p>
            </section>

            <section className="legal-section">
              <h2>GitHub Data Usage</h2>
              <div className="info-callout">
                <p><strong>How we handle OAuth:</strong> When you connect via GitHub, we receive a temporary token used solely to query public API stats. We do not store your code or have the ability to modify repositories.</p>
              </div>
            </section>

            <section className="legal-section">
              <h2>Your Rights</h2>
              <div className="rights-accordion">
                <details>
                  <summary>Right to Erasure (Forget Me) <span className="material-symbols-outlined">expand_more</span></summary>
                  <p>You can permanently delete your account and all associated data via the settings panel. Deletion occurs within 72 hours.</p>
                </details>
                <details>
                  <summary>Right to Data Portability <span className="material-symbols-outlined">expand_more</span></summary>
                  <p>Export your entire activity history and profile data in a machine-readable JSON format with a single click.</p>
                </details>
              </div>
            </section>

            <section className="legal-section">
              <h2>Contact Privacy Team</h2>
              <p>Have questions about our data pulse? Reach out to our dedicated privacy engineering team.</p>
              <a href="mailto:smsram001@gmail.com" className="legal-link">
                <span className="material-symbols-outlined">mail</span> smsram001@gmail.com
              </a>
            </section>
          </div>
        </article>

        <div className="legal-trust-note">
          TRUSTED BY 50,000+ ENGINEERS WORLDWIDE
        </div>
      </div>
    </div>
  );
}