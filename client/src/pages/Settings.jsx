import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import Skeleton from '../components/ui/Skeleton';
import Toast from '../components/ui/Toast';
import Loader from '../components/ui/Loader';
import './Settings.css';

export default function Settings() {
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null); // Ref for the hidden file input
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    skills: [],
    githubHandle: '',
    portfolioLink: '',
    resumeLink: '', // New field
    profilePicture: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/settings');
        const { user, settings } = res.data || {};
        
        setFormData({
          name: user?.name || '',
          role: settings?.headline || '',
          bio: settings?.bio || '',
          skills: settings?.skills || [],
          githubHandle: settings?.githubHandle || user?.username || '',
          portfolioLink: settings?.portfolioLink || '',
          resumeLink: settings?.resumeLink || '',
          profilePicture: settings?.profilePicture || ''
        });
      } catch (err) {
        setToast({ message: 'Failed to load settings data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Avatar Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setToast({ message: 'Uploading image...', type: 'success' });
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await API.post('/settings/upload-avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, profilePicture: res.data.secure_url }));
      setToast({ message: 'Image uploaded! Save to apply changes.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Image upload failed.', type: 'error' });
    }
  };

  // Resume PDF Upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'File is too large. Maximum size is 5MB.', type: 'error' });
      return;
    }

    setToast({ message: 'Uploading resume securely...', type: 'success' });
    const data = new FormData();
    data.append('file', file); // Matches upload.single('file') on backend

    try {
      const res = await API.post('/settings/upload-resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Automatically paste the generated Cloudinary link into the input field
      setFormData(prev => ({ ...prev, resumeLink: res.data.secure_url }));
      setToast({ message: 'Resume uploaded! Save to apply changes.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Resume upload failed.', type: 'error' });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/settings', formData);
      setToast({ message: 'Settings saved successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to save settings.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim() !== '') {
      e.preventDefault();
      if (!formData.skills.includes(newSkill.trim())) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="settings-wrapper">
        <section className="profile-edit-card">
          <div className="card-accent-bar"></div>
          <div className="profile-edit-layout">
            <Skeleton variant="rectangular" width="8rem" height="8rem" style={{ borderRadius: '1.25rem' }} />
            <div className="profile-fields">
              <Skeleton variant="text" width="50%" height="2.5rem" />
              <Skeleton variant="text" width="30%" height="1.5rem" />
              <div style={{ marginTop: '1.5rem' }}>
                <Skeleton variant="rectangular" width="100%" height="80px" style={{ borderRadius: '0.75rem' }} />
              </div>
            </div>
          </div>
        </section>
        <section className="settings-section">
          <Skeleton variant="text" width="150px" height="1.5rem" style={{ marginBottom: '1rem' }} />
          <Skeleton variant="rectangular" width="100%" height="140px" style={{ borderRadius: '1rem' }} />
        </section>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="settings-wrapper">
        <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
          
          <section className="profile-edit-card">
            <div className="card-accent-bar"></div>
            <div className="profile-edit-layout">
              <div className="avatar-edit-group" onClick={() => fileInputRef.current.click()}>
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Profile" className="edit-avatar" />
                ) : (
                  <div className="edit-avatar empty-avatar-placeholder">
                    <span className="material-symbols-outlined placeholder-icon">face</span>
                    <span className="upload-text">Upload</span>
                  </div>
                )}
                <div className="avatar-overlay">
                  <span className="material-symbols-outlined">photo_camera</span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
              </div>

              <div className="profile-fields">
                <div className="profile-header-inputs">
                  <div className="input-row">
                    <input 
                      className="input-name" 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                      placeholder="Your Name"
                    />
                    <span className="material-symbols-outlined edit-hint">edit</span>
                  </div>
                  <input 
                    className="input-role" 
                    type="text" 
                    value={formData.role}
                    onChange={e => setFormData(prev => ({...prev, role: e.target.value}))}
                    placeholder="Your Role (e.g. Senior Full Stack Engineer)"
                  />
                </div>
                <textarea 
                  className="input-bio" 
                  rows="3"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({...prev, bio: e.target.value}))}
                />
              </div>
            </div>
          </section>

          <section className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Skill Manager</h2>
              <span className="section-counter">{formData.skills.length} Skills</span>
            </div>
            <div className="skill-manager-card">
              <div className="skill-pill-grid">
                {formData.skills.map(skill => (
                  <div key={skill} className="skill-pill-edit">
                    <span>{skill}</span>
                    <button type="button" onClick={() => removeSkill(skill)} className="remove-skill-btn">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="add-skill-wrapper">
                <span className="material-symbols-outlined">add</span>
                <input 
                  type="text" 
                  className="add-skill-input"
                  placeholder="Type skill and press enter"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                />
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h2 className="section-title">Platform Integration</h2>
            <div className="integration-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* GitHub Handle */}
              <div className="integration-row">
                <div className="platform-icon github">
                  <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                </div>
                <div className="integration-details">
                  <label className="integration-label">GitHub Handle</label>
                  <div className="handle-input-group">
                    <div className="handle-prefix-wrapper">
                      <span className="handle-prefix">github.com/</span>
                      <input 
                        type="text" 
                        className="handle-input" 
                        value={formData.githubHandle}
                        onChange={e => setFormData(prev => ({...prev, githubHandle: e.target.value}))}
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Link */}
              <div className="integration-row">
                <div className="platform-icon portfolio-link-icon">
                  <span className="material-symbols-outlined">language</span>
                </div>
                <div className="integration-details">
                  <label className="integration-label">Personal Portfolio URL</label>
                  <div className="handle-input-group">
                    <div className="handle-prefix-wrapper">
                      <span className="handle-prefix">https://</span>
                      <input 
                        type="text" 
                        className="handle-input" 
                        value={formData.portfolioLink}
                        onChange={e => setFormData(prev => ({...prev, portfolioLink: e.target.value}))}
                        placeholder="yourdomain.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume Upload / Link */}
              <div className="integration-row">
                <div className="platform-icon" style={{ backgroundColor: '#EF4444', color: 'white' }}>
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="integration-details">
                  <label className="integration-label">Resume Link (Paste URL or Upload PDF)</label>
                  <div className="handle-input-group">
                    <div className="handle-prefix-wrapper" style={{ paddingLeft: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="handle-input" 
                        value={formData.resumeLink}
                        onChange={e => setFormData(prev => ({...prev, resumeLink: e.target.value}))}
                        placeholder="https://link-to-resume.pdf"
                      />
                    </div>
                    {/* Hidden File Input */}
                    <input 
                      type="file" 
                      ref={resumeInputRef} 
                      onChange={handleResumeUpload} 
                      accept=".pdf,.doc,.docx" 
                      style={{ display: 'none' }} 
                    />
                    {/* Upload Trigger Button */}
                    <button 
                      type="button" 
                      className="btn-sync" 
                      onClick={() => resumeInputRef.current.click()}
                      style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload_file</span>
                      Upload
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </form>

        <div className="save-action-container">
          <button className="btn-save-changes" onClick={handleSave} disabled={saving}>
            {saving ? <Loader size="20px" color="#ffffff" /> : (
              <>
                <span className="material-symbols-outlined">save</span>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}