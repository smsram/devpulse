import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import Toast from '../components/ui/Toast';
import Loader from '../components/ui/Loader';
import Skeleton from '../components/ui/Skeleton'; // Ensure this is imported
import './Portfolio.css';

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [username, setUsername] = useState('');
  
  const dragItem = useRef();
  const dragOverItem = useRef();
  const fileInputRefs = useRef({}); 

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const [projRes, setRes] = await Promise.all([
        API.get('/portfolio'),
        API.get('/settings')
      ]);
      const sortedProjects = projRes.data.sort((a, b) => a.orderIndex - b.orderIndex);
      setProjects(sortedProjects);
      setIsPublic(setRes.data.settings?.preferences?.portfolioIsPublic ?? true);
      setUsername(setRes.data.user?.username || '');
    } catch (err) {
      setToast({ message: 'Failed to load portfolio data', type: 'error' });
    } finally {
      // Small delay for smooth transition from skeleton to content
      setTimeout(() => setLoading(false), 600);
    }
  };

  const handleToggleVisibility = async () => {
    const newStatus = !isPublic;
    setIsPublic(newStatus);
    try {
      await API.put('/settings/visibility', { portfolioIsPublic: newStatus });
      setToast({ message: newStatus ? 'Portfolio is now Public' : 'Portfolio is now Private', type: 'success' });
    } catch (err) {
      setIsPublic(!newStatus);
      setToast({ message: 'Failed to update visibility', type: 'error' });
    }
  };

  const handleAddProject = async () => {
    if (projects.length >= 12) {
      setToast({ message: 'Maximum of 12 projects reached.', type: 'error' });
      return;
    }
    try {
      const res = await API.post('/portfolio');
      setProjects([...projects, res.data]);
    } catch (err) {
      setToast({ message: 'Failed to create project', type: 'error' });
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await API.delete(`/portfolio/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      setToast({ message: 'Project deleted', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to delete project', type: 'error' });
    }
  };

  const handleInputChange = (id, field, value) => {
    setProjects(projects.map(p => p._id === id ? { ...p, [field]: value } : p));
  };

  const handleTechStackChange = (id, value) => {
    const stackArray = value.split(',').map(s => s.trim()).filter(s => s !== '');
    handleInputChange(id, 'techStack', stackArray);
  };

  const handleImageUpload = async (projectId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setToast({ message: 'Uploading image...', type: 'success' });
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await API.post(`/portfolio/upload-image/${projectId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProjects(projects.map(p => p._id === projectId ? { ...p, image: res.data.image } : p));
      setToast({ message: 'Image uploaded!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Upload failed.', type: 'error' });
    }
  };

  const handleDragStart = (e, position) => {
    dragItem.current = position;
    setTimeout(() => e.target.classList.add('dragging'), 0);
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    const copyListItems = [...projects];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    const updatedOrderList = copyListItems.map((item, index) => ({...item, orderIndex: index}));
    dragItem.current = null;
    dragOverItem.current = null;
    setProjects(updatedOrderList);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(projects.map(project => API.put(`/portfolio/${project._id}`, project)));
      setToast({ message: 'Projects saved successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to save changes.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // SKELETON LOADING STATE
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className="portfolio-wrapper">
        <div className="portfolio-header">
          <div className="header-text">
            <Skeleton variant="text" width="150px" height="1rem" />
            <Skeleton variant="text" width="300px" height="3rem" style={{ marginTop: '0.5rem' }} />
          </div>
        </div>
        <section className="project-section">
          <div className="project-grid">
             {/* Add Project Card Skeleton */}
            <Skeleton variant="rectangular" height="400px" style={{ borderRadius: '1.25rem' }} />
            {/* Project Card Skeletons */}
            {[1, 2].map(i => (
              <div key={i} className="project-card-skeleton">
                <Skeleton variant="rectangular" height="200px" style={{ borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem' }} />
                <div style={{ padding: '1.5rem' }}>
                  <Skeleton variant="text" width="60%" height="2rem" />
                  <Skeleton variant="rectangular" height="80px" style={{ marginTop: '1rem', borderRadius: '0.5rem' }} />
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <Skeleton variant="rectangular" width="45%" height="40px" style={{ borderRadius: '0.5rem' }} />
                    <Skeleton variant="rectangular" width="45%" height="40px" style={{ borderRadius: '0.5rem' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="portfolio-wrapper animate-fade-in">
        <div className="portfolio-header">
          <div className="header-text">
            <h1 className="portfolio-title">Your Showcase Portfolio</h1>
            <p className="portfolio-subtitle">Curate your best engineering work for the world to see. Drag and drop to reorder your narrative.</p>
          </div>
          <div className="header-actions">
            <div className="visibility-toggle">
              <span className="toggle-label">{isPublic ? 'Publicly Visible' : 'Hidden (Private)'}</span>
              <button className={`toggle-switch ${isPublic ? 'active' : ''}`} onClick={handleToggleVisibility}>
                <span className="toggle-knob"></span>
              </button>
            </div>
            
            <button className="btn-live" onClick={() => window.open(`/${username}`, '_blank')}>
              <span className="material-symbols-outlined">visibility</span>
              View Live Portfolio
            </button>
          </div>
        </div>

        <section className="project-section">
          <div className="section-divider">
            <h3 className="section-label">Active Projects <span className="count-badge">{projects.length} Items</span></h3>
            <div className="divider-line"></div>
          </div>

          <div className="project-grid">
            <div className="add-project-card" onClick={handleAddProject}>
              <div className="add-icon-wrapper"><span className="material-symbols-outlined">add</span></div>
              <p className="add-text">Create New Project</p>
              <p className="limit-text">Limit: 12 Projects</p>
            </div>

            {projects.map((project, index) => (
              <div 
                className="project-card" 
                key={project._id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="project-thumb">
                  {project.image ? (
                    <img src={project.image} alt="Project" />
                  ) : (
                    <div className="empty-thumb-placeholder">
                      <span className="material-symbols-outlined">image</span>
                      <span>No Image</span>
                    </div>
                  )}
                  
                  <div className="thumb-overlay" onClick={() => fileInputRefs.current[project._id].click()}>
                    <span className="material-symbols-outlined">upload</span>
                    <span>Upload Image</span>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={el => fileInputRefs.current[project._id] = el}
                    onChange={(e) => handleImageUpload(project._id, e)}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  <div className="card-controls">
                    <button className="control-btn delete" onClick={(e) => handleDeleteProject(project._id, e)}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                    <div className="control-btn drag"><span className="material-symbols-outlined">drag_indicator</span></div>
                  </div>
                </div>

                <div className="project-form">
                  <div className="form-group">
                    <label>Project Title</label>
                    <input type="text" value={project.title} onChange={(e) => handleInputChange(project._id, 'title', e.target.value)} className="input-bold" placeholder="Project Title" />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={project.description} onChange={(e) => handleInputChange(project._id, 'description', e.target.value)} placeholder="Description"></textarea>
                  </div>
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Role</label>
                      <input type="text" value={project.role} onChange={(e) => handleInputChange(project._id, 'role', e.target.value)} placeholder="Role" />
                    </div>
                    <div className="form-group flex-1">
                      <label>Tech Stack</label>
                      <input type="text" value={project.techStack.join(', ')} onChange={(e) => handleTechStackChange(project._id, e.target.value)} placeholder="React, Node, etc." />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="link-input">
                      <span className="material-symbols-outlined">link</span>
                      <input type="text" value={project.liveUrl} onChange={(e) => handleInputChange(project._id, 'liveUrl', e.target.value)} placeholder="Live URL" />
                    </div>
                    <div className="link-input">
                      <span className="material-symbols-outlined">terminal</span>
                      <input type="text" value={project.githubUrl} onChange={(e) => handleInputChange(project._id, 'githubUrl', e.target.value)} placeholder="GitHub URL" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button className={`fab-save ${saving ? 'saving-active' : ''}`} onClick={handleSaveAll} disabled={saving}>
          {saving ? <Loader size="24px" color="white" /> : (
            <>
              <span className="material-symbols-outlined">save</span>
              <span className="fab-text">Save Changes</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}