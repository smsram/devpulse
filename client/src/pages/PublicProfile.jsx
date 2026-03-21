import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/ui/Loader'; // Adjust path if needed
import './PublicProfile.css';

export default function PublicProfile() {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Refs for top-bar navigation
  const portfolioRef = useRef(null);
  const analyticsRef = useRef(null);
  const insightsRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPublicProfile = async () => {
      try {
        const res = await API.get(`/public/user/${username}`);
        if (res.data.settings?.preferences?.portfolioIsPublic === false) {
          throw new Error("Profile is private");
        }
        setData(res.data);
      } catch (err) {
        setError("This profile is either private or does not exist.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  // --- SCROLL REVEAL LOGIC (One-Time Animation) ---
  useEffect(() => {
    if (loading || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Unobserve after revealing once
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, error, data]);

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      const yOffset = -100;
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const generateSparkline = (timelineData) => {
    if (!timelineData || timelineData.length === 0) {
      return { path: "M0,80 L400,80", fill: "M0,80 L400,80 L400,100 L0,100 Z" };
    }
    const width = 400;
    const height = 80;
    const maxSkills = Math.max(...timelineData.map(d => d.totalSkills), 1);
    const stepX = width / Math.max(timelineData.length - 1, 1);

    let pathD = `M0,${height}`;
    timelineData.forEach((point, index) => {
      const x = index * stepX;
      const y = height - ((point.totalSkills / maxSkills) * height);
      pathD += ` L${x},${y}`;
    });

    return { path: pathD, fill: `${pathD} L${width},100 L0,100 Z` };
  };

  if (error) {
    return (
      <div className="pp-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--outline)', marginBottom: '1rem' }}>visibility_off</span>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem' }}>Profile Unavailable</h2>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>{error}</p>
        <Link to="/" className="pp-btn-primary">Return Home</Link>
      </div>
    );
  }

  if (loading) {
    return <Loader fullPage size="48px" color="var(--primary)" />;
  }

  const { user, settings, projects, githubData, recentRepos } = data;
  const svgData = generateSparkline(githubData?.timeline);
  const githubHandle = settings?.githubHandle || user?.username;

  return (
    <div className="pp-wrapper">
      
      {/* Top Navigation */}
      <header className="pp-topbar">
        <nav className="pp-nav">
          <Link to="/" className="pp-logo">DevPulse</Link>
          <div className="pp-nav-links">
            {projects?.length > 0 && <span className="pp-nav-link" onClick={() => scrollToSection(portfolioRef)}>Portfolio</span>}
            {githubData && <span className="pp-nav-link" onClick={() => scrollToSection(analyticsRef)}>Analytics</span>}
            {recentRepos?.length > 0 && <span className="pp-nav-link" onClick={() => scrollToSection(insightsRef)}>Insights</span>}
          </div>
          <div className="pp-nav-actions">
            <a href={`mailto:${user?.email}`} className="pp-btn-primary">Connect</a>
            {settings?.profilePicture ? (
              <img src={settings.profilePicture} alt={user?.name} className="pp-nav-avatar" />
            ) : (
              <div className="pp-nav-avatar-placeholder"><span className="material-symbols-outlined">person</span></div>
            )}
          </div>
        </nav>
      </header>

      <main className="pp-main">
        {/* Profile Header */}
        <section className="pp-section reveal-on-scroll">
          <div className="pp-card pp-header-card">
            <div className="pp-cover-gradient"></div>
            <div className="pp-header-content">
              {settings?.profilePicture ? (
                <img src={settings.profilePicture} alt={user?.name} className="pp-avatar hover-lift" />
              ) : (
                <div className="pp-avatar-placeholder hover-lift"><span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>person</span></div>
              )}
              
              <div className="pp-header-text">
                <h1 className="pp-name">{user?.name || username}</h1>
                {settings?.headline && <p className="pp-role">{settings.headline}</p>}
                {settings?.bio && <p className="pp-bio">{settings.bio}</p>}
                
                {/* User Skills from Settings */}
                {settings?.skills?.length > 0 && (
                  <div className="pp-user-skills">
                    {settings.skills.map(skill => (
                      <span key={skill} className="pp-header-skill-pill">{skill}</span>
                    ))}
                  </div>
                )}
                
                <div className="pp-actions">
                  <a href={`mailto:${user?.email}`} className="pp-btn-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span> Connect
                  </a>
                  {settings?.resumeLink && (
                    <a href={settings.resumeLink} target="_blank" rel="noopener noreferrer" className="pp-btn-outline">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>description</span> View Resume
                    </a>
                  )}
                  {settings?.portfolioLink && (
                    <a href={settings.portfolioLink.startsWith('http') ? settings.portfolioLink : `https://${settings.portfolioLink}`} target="_blank" rel="noopener noreferrer" className="pp-btn-outline">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>language</span> Personal Site
                    </a>
                  )}
                  {/* GitHub Link extracted dynamically */}
                  {githubHandle && (
                    <a href={`https://github.com/${githubHandle}`} target="_blank" rel="noopener noreferrer" className="pp-btn-outline">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>code</span> GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- GITHUB ANALYTICS SECTIONS --- */}
        {githubData && (
          <div ref={analyticsRef}>
            {/* Growth Metrics */}
            <section className="pp-metrics-grid">
              <div className="pp-metric-card reveal-on-scroll hover-lift">
                <div>
                  <p className="pp-metric-label">Languages Mastered</p>
                  <h3 className="pp-metric-value">{githubData.totalSkills || 0}</h3>
                </div>
                <div className="pp-metric-icon bg-indigo"><span className="material-symbols-outlined">code</span></div>
              </div>
              
              <div className="pp-metric-card reveal-on-scroll hover-lift delay-100">
                <div>
                  <p className="pp-metric-label">Total Contributions</p>
                  <div className="pp-metric-row">
                    <h3 className="pp-metric-value">{(githubData.totalCommits || 0).toLocaleString()}</h3>
                    <div className="pp-trend">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span> Active
                    </div>
                  </div>
                </div>
                <div className="pp-metric-icon bg-emerald"><span className="material-symbols-outlined">auto_graph</span></div>
              </div>

              <div className="pp-metric-card reveal-on-scroll hover-lift delay-200">
                <div>
                  <p className="pp-metric-label">Activity Status</p>
                  <div className="pp-metric-row">
                    <h3 className="pp-metric-value">Online</h3>
                    <div className="pp-pulse-dot"></div>
                  </div>
                </div>
                <div className="pp-metric-icon bg-orange"><span className="material-symbols-outlined">bolt</span></div>
              </div>
            </section>

            {/* Timeline & Heatmap */}
            <section className="pp-charts-grid">
              <div className="pp-card pp-chart-wide reveal-on-scroll hover-lift">
                <div className="pp-chart-header">
                  <div>
                    <h2 className="pp-section-title">Language Acquisition Timeline</h2>
                    <p className="pp-subtitle">Learning trajectory over repository history</p>
                  </div>
                </div>
                <div className="pp-sparkline-container">
                  <svg className="pp-sparkline-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'rgba(70, 72, 212, 0.2)' }}></stop>
                        <stop offset="100%" style={{ stopColor: 'rgba(70, 72, 212, 0)' }}></stop>
                      </linearGradient>
                    </defs>
                    <path d={svgData.fill} fill="url(#gradient)"></path>
                    <path d={svgData.path} fill="none" stroke="var(--primary)" strokeLinecap="round" strokeWidth="3"></path>
                  </svg>
                </div>
              </div>

              <div className="pp-card pp-chart-small reveal-on-scroll hover-lift delay-100">
                <h2 className="pp-section-title">Commit Pulse</h2>
                <p className="pp-subtitle mb-4">Recent push frequency</p>
                <div className="pp-heatmap-grid">
                  {(githubData.heatmap || Array(35).fill(0)).map((level, i) => (
                    <div key={i} className={`pp-heat-box lvl-${level}`}></div>
                  ))}
                </div>
                <div className="pp-heatmap-legend">
                  <span>Less</span>
                  <div className="pp-legend-boxes">
                    <div className="lvl-0"></div><div className="lvl-1"></div><div className="lvl-2"></div><div className="lvl-3"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            </section>

            {/* Proficiency Breakdown */}
            {githubData.proficiency?.length > 0 && (
              <section className="pp-section reveal-on-scroll">
                <h2 className="pp-section-title mb-6">Proficiency Breakdown</h2>
                <div className="pp-card pp-proficiency-container hover-lift">
                  <div className="pp-proficiency-grid">
                    {githubData.proficiency.map((skill, i) => (
                      <div key={i} className="pp-skill-row">
                        <div className="pp-skill-labels">
                          <span className="pp-skill-name">{skill.name}</span>
                          <span className="pp-skill-pct">{skill.level}</span>
                        </div>
                        <div className="pp-skill-bar-bg">
                          {/* The width is applied via style, we can trigger animation via CSS */}
                          <div className="pp-skill-bar-fill" style={{ width: skill.level }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* --- PROJECTS SECTION --- */}
        {projects?.length > 0 && (
          <section className="pp-section" ref={portfolioRef}>
            <div className="pp-section-header reveal-on-scroll">
              <h2 className="pp-section-title">Featured Projects</h2>
              <span className="pp-count-badge">{projects.length}</span>
            </div>
            <div className="pp-projects-grid">
              {projects.map((project, index) => (
                <div key={project._id} className={`pp-project-card group reveal-on-scroll hover-lift delay-${(index % 3) * 100}`}>
                  <div className="pp-project-image-wrap">
                    {project.image ? (
                      <img src={project.image} alt={project.title} className="pp-project-img" />
                    ) : (
                      <div className="pp-project-img-placeholder"><span className="material-symbols-outlined">image</span></div>
                    )}
                    <div className="pp-image-overlay"></div>
                  </div>
                  <div className="pp-project-content">
                    <div className="pp-project-top">
                      <div>
                        <h3 className="pp-project-title">{project.title}</h3>
                        {project.role && <p className="pp-project-role">{project.role}</p>}
                      </div>
                      <div className="pp-project-links">
                        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"><span className="material-symbols-outlined">launch</span></a>}
                        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><span className="material-symbols-outlined">terminal</span></a>}
                      </div>
                    </div>
                    <p className="pp-project-desc">{project.description}</p>
                    <div className="pp-tech-stack">
                      {project.techStack?.map(tech => <span key={tech} className="pp-tech-pill">{tech}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- GITHUB ACTIVITY FEED --- */}
        {recentRepos?.length > 0 && (
          <section className="pp-section" ref={insightsRef}>
            <h2 className="pp-section-title mb-6 flex items-center gap-2 reveal-on-scroll">
              <span className="material-symbols-outlined text-primary">rss_feed</span> Recent Activity
            </h2>
            <div className="pp-feed-list">
              {recentRepos.map((repo, index) => (
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" key={repo.id} className={`pp-feed-item group reveal-on-scroll hover-lift delay-${(index % 3) * 100}`}>
                  <div className="pp-feed-left">
                    <div className="pp-feed-icon"><span className="material-symbols-outlined">folder_open</span></div>
                    <div>
                      <h4 className="pp-feed-title">{repo.full_name}</h4>
                      <p className="pp-feed-desc">{repo.description || 'No description provided.'}</p>
                    </div>
                  </div>
                  <div className="pp-feed-right">
                    {repo.language && (
                      <div className="pp-feed-meta-item">
                        <div className="pp-lang-dot"></div> <span className="pp-meta-text">{repo.language}</span>
                      </div>
                    )}
                    <div className="pp-feed-meta-item">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>star</span> 
                      <span className="pp-meta-text">{repo.stargazers_count}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

      </main>

      <footer className="pp-footer">
        <div className="pp-footer-content reveal-on-scroll">
          <div className="pp-footer-logo">DevPulse</div>
          <p className="pp-footer-text">© {new Date().getFullYear()} DevPulse Editorial. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}