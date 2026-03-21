import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Skeleton from '../components/ui/Skeleton';
import Toast from '../components/ui/Toast';
import './Dashboard.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [userData, setUserData] = useState({
    name: '',
    email: '', 
    role: '',
    bio: '',
    avatar: '',
    skills: [],
    githubHandle: '',
    portfolioLink: '', 
    resumeLink: ''     
  });
  
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch real user profile from your Node.js Backend
        const res = await API.get('/settings');
        const { user, settings } = res.data || {};
        
        const github = settings?.githubHandle || user?.username || ''; 

        setUserData({
          name: user?.name || '',
          email: user?.email || '', 
          role: settings?.headline || '',
          bio: settings?.bio || '',
          avatar: settings?.profilePicture || '',
          skills: settings?.skills || [],
          githubHandle: github,
          portfolioLink: settings?.portfolioLink || '',
          resumeLink: settings?.resumeLink || ''
        });

        // 2. Fetch real public repos SECURELY from your backend (no rate limits!)
        if (github) {
          const reposRes = await API.get(`/github/repos/${github}`);
          setRepos(reposRes.data);
        }
      } catch (err) {
        console.error(err);
        setToast({ message: 'Failed to load dashboard data from server.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 86400) return 'Updated today';
    const days = Math.floor(diffInSeconds / 86400);
    if (days < 30) return `Updated ${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `Updated ${months} month${months > 1 ? 's' : ''} ago`;
  };

  const getLangColor = (lang) => {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      HTML: '#e34c26',
      CSS: '#563d7c',
      C: '#555555',
      'C++': '#f34b7d',
      'C#': '#178600',
      Ruby: '#701516',
      Go: '#00ADD8'
    };
    return colors[lang] || '#8b949e';
  };

  const formatUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  // ----------------------------------------------------
  // SKELETON LOADING STATE
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <section className="editorial-card">
          <div className="bg-decoration"></div>
          <div className="profile-layout">
            <div className="profile-image-container">
              <Skeleton variant="rectangular" width="100%" height="100%" style={{ borderRadius: '1.25rem' }} />
            </div>
            <div className="profile-info">
              <Skeleton variant="text" width="50%" height="2.5rem" />
              <Skeleton variant="text" width="30%" height="1.5rem" style={{ marginBottom: '1.5rem' }} />
              <Skeleton variant="text" width="100%" height="1rem" />
              <Skeleton variant="text" width="100%" height="1rem" />
              <Skeleton variant="text" width="80%" height="1rem" style={{ marginBottom: '2rem' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Skeleton variant="rectangular" width="110px" height="42px" style={{ borderRadius: '999px' }} />
                <Skeleton variant="rectangular" width="130px" height="42px" style={{ borderRadius: '999px' }} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-title-wrapper">
            <Skeleton variant="text" width="200px" height="1.5rem" />
            <div className="title-divider"></div>
          </div>
          <div className="skills-container">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rectangular" width="100px" height="36px" style={{ borderRadius: '999px', display: 'inline-block', marginRight: '0.75rem', marginBottom: '0.75rem' }} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ----------------------------------------------------
  // LOADED STATE
  // ----------------------------------------------------
  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="dashboard-wrapper">
        
        {/* Profile Section */}
        <section className="editorial-card animate-fade-in stagger-1">
          <div className="bg-decoration"></div>
          <div className="profile-layout">
            <div className="profile-image-container">
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-container-high)', borderRadius: '1.25rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--outline)' }}>person</span>
                </div>
              )}
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{userData.name || "User"}</h2>
              
              {userData.role && <p className="profile-role">{userData.role}</p>}
              
              <p className="profile-bio">
                {userData.bio || "No bio provided. Update your profile in settings."}
              </p>
              
              <div className="profile-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a 
                  href={`mailto:${userData.email}`} 
                  className="btn-connect"
                  style={{ textDecoration: 'none' }}
                >
                  Connect
                </a>
                
                {userData.resumeLink && (
                  <a 
                    href={userData.resumeLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-resume"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
                    View Resume
                  </a>
                )}

                {userData.portfolioLink && (
                  <a 
                    href={formatUrl(userData.portfolioLink)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-resume" 
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>language</span>
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Technical Expertise */}
        <section className="animate-fade-in stagger-2">
          <div className="section-title-wrapper">
            <h3 className="section-title">Technical Expertise</h3>
            <div className="title-divider"></div>
          </div>
          <div className="skills-container">
            {userData.skills.length > 0 ? (
              userData.skills.map((skill, index) => (
                <span key={index} className="skill-pill">{skill}</span>
              ))
            ) : (
              <p style={{ color: 'var(--outline-variant)', fontSize: '0.875rem' }}>No skills added yet.</p>
            )}
          </div>
        </section>

        {/* GitHub Repository Feed */}
        <section className="animate-fade-in stagger-3">
          <div className="section-title-wrapper" style={{ marginBottom: '1.5rem', border: 'none' }}>
            <h3 className="section-title">Latest Repo Activity</h3>
            {userData.githubHandle && repos.length > 0 && (
              <div className="live-indicator">
                <span className="dot"></span>
                Live Update
              </div>
            )}
          </div>
          
          {repos.length > 0 ? (
            <div className="repo-grid">
              {repos.map(repo => (
                <a 
                  key={repo.id} 
                  href={repo.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="repo-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="repo-content">
                    <h4 className="repo-title">{repo.name}</h4>
                    <p className="repo-desc">
                      {repo.description || 'No description provided for this repository.'}
                    </p>
                    <div className="repo-meta">
                      {repo.language && (
                        <div className="meta-item">
                          <span className="lang-dot" style={{ backgroundColor: getLangColor(repo.language) }}></span>
                          <span className="meta-text">{repo.language}</span>
                        </div>
                      )}
                      <div className="meta-item" style={{ color: '#10B981' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="star-text">{repo.stargazers_count}</span>
                      </div>
                      <span className="meta-time">{getRelativeTime(repo.updated_at)}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined arrow-icon">arrow_outward</span>
                </a>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '1rem', border: '1px dashed var(--outline-variant)' }}>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                {userData.githubHandle 
                  ? "No public repositories found." 
                  : "Link your GitHub in settings to showcase repositories."}
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}