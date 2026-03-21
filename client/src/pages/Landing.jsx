import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/ui/Loader';
import './Landing.css';

export default function Landing() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Adjust this number to control how many cards per page

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const res = await API.get('/public/users');
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load directory", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  // Filter Logic: Matches Name, Role, or Skills
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.headline?.toLowerCase().includes(query) ||
      user.skills?.some(skill => skill.toLowerCase().includes(query))
    );
  });

  // --- Pagination Logic ---
  // Reset to page 1 whenever the user types a new search query
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  // Calculate the slice of users to show on the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Handlers for next/prev buttons
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  // Helper to generate the correct page numbers to display
  const renderPageNumbers = () => {
    const pages = [];
    // Only showing up to 3 pages for simplicity. If you have many pages, 
    // you might want to add an ellipsis (...) logic here.
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button 
            key={i} 
            onClick={() => setCurrentPage(i)}
            className={`page-btn ${currentPage === i ? 'active' : ''}`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(<span key={i} className="page-ellipsis">...</span>);
      }
    }
    // Filter out consecutive ellipses if they occur
    return pages.filter((item, pos, arr) => 
      item.type !== 'span' || arr[pos - 1]?.type !== 'span'
    );
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            The Pulse of <span className="text-gradient">Engineering.</span>
          </h1>
          <p className="hero-subtitle">
            Real-time visibility into developer growth and repo activity across the team. Discover top talent and technical velocity in one curated directory.
          </p>
          
          <div className="search-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <input 
              className="search-input" 
              placeholder="Search developers or skills (e.g., React, Node)..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="directory-section container">
        <div className="section-header">
          <div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: '800', color: 'var(--on-surface)', marginBottom: '0.25rem' }}>Active Contributors</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
              Showing {filteredUsers.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredUsers.length)} of {users.length} verified engineers
            </p>
          </div>
          <button className="page-btn" style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>tune</span>
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '4rem 0' }}><Loader size="48px" color="var(--primary)" /></div>
        ) : filteredUsers.length > 0 ? (
          <div className="dev-grid">
            {/* Map over currentUsers instead of filteredUsers */}
            {currentUsers.map((user, index) => (
              <div className="dev-card" key={user.id || index} style={{ animationDelay: `${(index % itemsPerPage) * 0.05}s` }}>
                <div className="card-header">
                  <div className="avatar-wrapper">
                    {user.profilePicture ? (
                      <img alt={user.name} className="avatar" src={user.profilePicture} />
                    ) : (
                      <div className="avatar-placeholder"><span className="material-symbols-outlined">person</span></div>
                    )}
                    <span className="pulse-dot"></span>
                  </div>
                  <span className="badge">Active</span>
                </div>
                <h3 className="dev-name">{user.name}</h3>
                <p className="dev-role">{user.headline || 'Software Engineer'}</p>
                <div className="skills">
                  {user.skills?.slice(0, 3).map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                  {user.skills?.length > 3 && (
                    <span className="skill-tag" style={{ background: 'transparent', border: '1px dashed var(--outline-variant)' }}>
                      +{user.skills.length - 3}
                    </span>
                  )}
                  {(!user.skills || user.skills.length === 0) && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--outline-variant)' }}>No skills listed</span>
                  )}
                </div>
                <Link to={`/${user.username}`} className="btn-full" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  View Pulse
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--outline)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }}>search_off</span>
            <h3 style={{ fontFamily: 'var(--font-headline)', color: 'var(--on-surface)' }}>No developers found</h3>
            <p>Try adjusting your search terms.</p>
          </div>
        )}

        {/* Functional Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn" 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {renderPageNumbers()}
            
            <button 
              className="page-btn" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </section>
    </>
  );
}