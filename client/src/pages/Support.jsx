import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import './Support.css';

export default function Support() {
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [formStatus, setFormStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    const form = e.target;
    
    const formData = {
      email: form.email.value,
      subject: form.subject.value,
      message: form.message.value
    };
    
    try {
      // Internal API call handles both DB notification and Formspree forwarding
      const response = await API.post("/public/support", formData);
      
      if (response.status === 200) {
        setFormStatus('success');
        form.reset();
        
        setTimeout(() => {
          setShowTicketForm(false);
          setFormStatus('');
        }, 3500);
      } else {
        setFormStatus('error');
      }
    } catch (err) {
      console.error("Support submission failed", err);
      setFormStatus('error');
    }
  };

  return (
    <div className="support-wrapper animate-fade-in">
      <section className="support-hero">
        <div className="support-hero-content">
          <h1 className="support-title">How can we help?</h1>
          <p className="support-subtitle">Browse common topics below or open a direct ticket with our engineering team.</p>
        </div>
        <div className="hero-glow top-right"></div>
        <div className="hero-glow bottom-left"></div>
      </section>

      <section className="support-main-section">
        {!showTicketForm ? (
          <div className="support-grid">
            {/* Category Cards */}
            <div className="support-card">
              <div className="support-icon-box bg-indigo">
                <span className="material-symbols-outlined">rocket_launch</span>
              </div>
              <h3 className="support-card-title">Getting Started</h3>
              <ul className="support-links">
                <li><a href="#guide">Installation Guide <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
                <li><a href="#first-pulse">Creating your first Pulse <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
                <li><a href="#config">Workspace configuration <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
              </ul>
            </div>

            <div className="support-card">
              <div className="support-icon-box bg-orange">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3 className="support-card-title">Account & Billing</h3>
              <ul className="support-links">
                <li><a href="#subs">Managing subscriptions <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
                <li><a href="#payment">Updating payment methods <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
                <li><a href="#invoices">Invoice history access <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
              </ul>
            </div>

            <div className="support-card">
              <div className="support-icon-box bg-emerald">
                <span className="material-symbols-outlined">security</span>
              </div>
              <h3 className="support-card-title">Security & Privacy</h3>
              <ul className="support-links">
                <li><a href="#2fa">Two-factor authentication <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
                <li><a href="#gdpr">GDPR Compliance docs <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
                <li><a href="#audit">Audit logs extraction <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
              </ul>
            </div>

            <div className="support-card">
              <div className="support-icon-box bg-rose">
                <span className="material-symbols-outlined">speed</span>
              </div>
              <h3 className="support-card-title">Performance</h3>
              <ul className="support-links">
                <li><a href="#latency">Optimizing query latency <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
                <li><a href="#cache">Caching strategies <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
                <li><a href="#benchmarks">Benchmarking results <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
              </ul>
            </div>

            <div className="support-card">
              <div className="support-icon-box bg-indigo">
                <span className="material-symbols-outlined">monitoring</span>
              </div>
              <h3 className="support-card-title">Pulse Insights</h3>
              <ul className="support-links">
                <li><a href="#dash">Real-time dashboarding <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
                <li><a href="#anomaly">AI anomaly detection <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
                <li><a href="#export">Exporting datasets <span className="material-symbols-outlined arrow">arrow_forward</span></a></li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="ticket-form-container">
            <button className="back-btn" onClick={() => setShowTicketForm(false)}>
              <span className="material-symbols-outlined">arrow_back</span> Back to Help Topics
            </button>
            
            <div className="ticket-form-card">
              <h2 className="form-title">Open a Support Ticket</h2>
              <p className="form-subtitle">Fill out the details below and our team will get back to you shortly.</p>
              
              {formStatus === 'success' ? (
                <div className="form-success-msg">
                  <span className="material-symbols-outlined">check_circle</span>
                  <p>Your ticket has been submitted successfully!</p>
                  <span className="text-sm text-muted">A notification has been sent to your DevPulse dashboard.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="ticket-form">
                  <div className="form-group">
                    <label>Account Email Address</label>
                    <input type="email" name="email" required placeholder="name@company.com" disabled={formStatus === 'sending'} />
                  </div>
                  <div className="form-group">
                    <label>Subject / Topic</label>
                    <select name="subject" required disabled={formStatus === 'sending'}>
                      <option value="">Select a category...</option>
                      <option value="Billing">Billing Issue</option>
                      <option value="Technical">Technical Support</option>
                      <option value="Bug">Report a Bug</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="message" rows="5" required placeholder="Please describe your issue in detail..." disabled={formStatus === 'sending'}></textarea>
                  </div>
                  <button type="submit" className="btn-primary form-submit-btn" disabled={formStatus === 'sending'}>
                    {formStatus === 'sending' ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                  {formStatus === 'error' && <p className="form-error-msg">Failed to send request. Please try again later.</p>}
                </form>
              )}
            </div>
          </div>
        )}
      </section>

      {!showTicketForm && (
        <section className="support-contact-section">
          <div className="contact-content">
            <h2 className="contact-title">Still need help?</h2>
            <p className="contact-subtitle">Our team of engineers is available 24/7 to help you resolve any issues or answer technical questions.</p>
            <div className="contact-actions">
              <button className="btn-primary large-btn" onClick={() => setShowTicketForm(true)}>
                <span className="material-symbols-outlined">confirmation_number</span> Open a Ticket
              </button>
            </div>
            <div className="system-status">
              <div className="status-item">
                <span className="status-dot-pulse"></span> System Status: Operational
              </div>
              <div className="status-item">
                <span className="material-symbols-outlined">schedule</span> Avg. Response: 14 mins
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}