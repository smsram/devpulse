import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Skeleton from '../components/ui/Skeleton';
import Toast from '../components/ui/Toast';
import './Analytics.css';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [animate, setAnimate] = useState(false);
  
  const [stats, setStats] = useState({
    totalSkills: 0,
    totalCommits: 0,
    proficiency: [],
    timeline: [],
    heatmap: Array(35).fill(0) // Default empty state
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Call our new dedicated Backend route!
        const res = await API.get('/analytics/github');
        setStats(res.data);
        
        // Trigger animations after data is loaded and DOM updates
        setTimeout(() => setAnimate(true), 100);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        setToast({ message: "Connect your GitHub in Settings to view analytics.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Helper function to generate SVG Sparkline Path dynamically based on timeline data
  const generateSparkline = (timelineData) => {
    if (!timelineData || timelineData.length === 0) {
      return { path: "M0,180 L800,180", fill: "M0,180 L800,180 V200 H0 Z" };
    }
    
    const width = 800;
    const height = 180; // Keep 20px padding at bottom
    const maxSkills = Math.max(...timelineData.map(d => d.totalSkills), 1);
    const stepX = width / Math.max(timelineData.length - 1, 1);

    let pathD = "M0,180"; // Start at bottom left
    timelineData.forEach((point, index) => {
      const x = index * stepX;
      // Invert Y axis (SVG 0,0 is top left)
      const y = height - ((point.totalSkills / maxSkills) * height);
      pathD += ` L${x},${y}`;
    });

    return {
      path: pathD,
      fill: `${pathD} V200 H0 Z`
    };
  };

  const svgData = generateSparkline(stats.timeline);

  if (loading) {
    return (
      <div className="analytics-wrapper">
        <Skeleton variant="text" width="200px" height="3rem" />
        <div className="metrics-grid" style={{ marginTop: '2rem' }}>
          <Skeleton variant="rectangular" height="120px" style={{ borderRadius: '1rem' }} />
          <Skeleton variant="rectangular" height="120px" style={{ borderRadius: '1rem' }} />
          <Skeleton variant="rectangular" height="120px" style={{ borderRadius: '1rem' }} />
        </div>
        <Skeleton variant="rectangular" height="300px" style={{ marginTop: '2rem', borderRadius: '1rem' }} />
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className={`analytics-wrapper ${animate ? 'is-visible' : ''}`}>
        <header className="analytics-header animate-fade-in">
          <div className="header-content">
            <h2 className="page-title">Growth Metrics</h2>
            <p className="page-subtitle">Measuring your engineering evolution based on your GitHub repository history.</p>
          </div>
        </header>

        <div className="metrics-grid">
          <div className="metric-card indigo-border stagger-1">
            <p className="metric-label">Languages Mastered</p>
            <div className="metric-value-row">
              <span className="metric-number">{stats.totalSkills}</span>
              <span className="metric-badge">Verified</span>
            </div>
          </div>
          <div className="metric-card primary-border stagger-2">
            <p className="metric-label">Total GitHub Commits</p>
            <div className="metric-value-row">
              <span className="metric-number">{stats.totalCommits.toLocaleString()}</span>
              <span className="material-symbols-outlined trend-icon">trending_up</span>
            </div>
          </div>
          <div className="metric-card tertiary-border stagger-3">
            <p className="metric-label">Activity Status</p>
            <div className="metric-value-row">
              <span className="metric-number">Active</span>
              <div className="pulse-indicator"></div>
            </div>
          </div>
        </div>

        <div className="charts-row animate-fade-in stagger-4">
          <div className="main-chart-card">
            <div className="card-header">
              <h3>Language Acquisition Timeline</h3>
              <span className="material-symbols-outlined">insights</span>
            </div>
            <div className="chart-container">
              <div className="grid-overlay"></div>
              <svg className="sparkline" viewBox="0 0 800 200" preserveAspectRatio="none">
                <path 
                  className={`sparkline-path ${animate ? 'draw-path' : ''}`} 
                  d={svgData.path} 
                />
                <path 
                  className="sparkline-fill" 
                  d={svgData.fill} 
                />
              </svg>
              <div className="chart-labels">
                {stats.timeline.length > 0 ? (
                  <>
                    <span>{stats.timeline[0].date}</span>
                    <span>{stats.timeline[Math.floor(stats.timeline.length / 2)]?.date || ''}</span>
                    <span>{stats.timeline[stats.timeline.length - 1].date}</span>
                  </>
                ) : (
                  <span>No data</span>
                )}
              </div>
            </div>
          </div>

          <div className="heatmap-card animate-fade-in stagger-5">
            <div className="card-header">
              <h3>Commit Pulse (Last 35 Days)</h3>
              <div className="heatmap-legend">
                <div className="lvl-1"></div>
                <div className="lvl-2"></div>
                <div className="lvl-3"></div>
              </div>
            </div>
            <div className="heatmap-grid">
              {stats.heatmap.map((level, i) => (
                <div key={i} className={`heat-box lvl-${level}`}></div>
              ))}
            </div>
            <p className="heatmap-footer">Tracking your daily engineering momentum.</p>
          </div>
        </div>

        <section className="top-skills-card animate-fade-in stagger-6">
          <h3 className="section-title">Proficiency Breakdown (By Repository Count)</h3>
          <div className="skills-bar-list">
            {stats.proficiency.length > 0 ? (
              stats.proficiency.slice(0, 6).map((skill) => (
                <div key={skill.name} className="skill-bar-row">
                  <span className="skill-name">{skill.name}</span>
                  <div className="bar-wrapper">
                    <div 
                      className="bar-fill" 
                      style={{ width: animate ? skill.level : '0%' }}
                    ></div>
                  </div>
                  <span className="skill-percentage">{skill.level}</span>
                </div>
              ))
            ) : (
              <p className="no-data" style={{ padding: '2rem', textAlign: 'center', color: 'var(--outline)' }}>
                Not enough public repository data to calculate proficiency.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}