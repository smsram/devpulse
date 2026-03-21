import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import ConfirmAlert from './ui/ConfirmAlert'; 
import './AppLayout.css';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal & Notification States
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  // Profile State
  const [userAvatar, setUserAvatar] = useState(null);
  const [loadingAvatar, setLoadingAvatar] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentUsername = pathSegments[1] || 'user';
  
  // Calculate breadcrumb display name
  let currentPage = 'Dashboard';
  if (pathSegments.length > 2) {
    currentPage = pathSegments[pathSegments.length - 1];
    currentPage = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
  }

  // Close overlays on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
    setShowSearchDropdown(false);
    setSearchQuery('');
  }, [location]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchLayoutData = async () => {
      try {
        API.get('/settings').then(res => {
          setUserAvatar(res.data.settings?.profilePicture || null);
          setLoadingAvatar(false);
        }).catch(() => setLoadingAvatar(false));

        API.get('/notifications').then(res => {
          setNotifications(res.data);
          setLoadingNotifs(false);
        }).catch(() => setLoadingNotifs(false));
      } catch (err) {
        console.error("Layout fetch error:", err);
      }
    };
    fetchLayoutData();
  }, []);

  // Handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutConfirm = () => {
    localStorage.removeItem('devpulse_token');
    navigate('/login');
  };

  const toggleNotifications = async () => {
    const isOpening = !showNotifs;
    setShowNotifs(isOpening);
    if (showSearchDropdown) setShowSearchDropdown(false);
    
    if (isOpening && unreadCount > 0) {
      try {
        await API.put('/notifications/read');
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Failed to mark notifications read", err);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- UPDATED SEARCH & NAVIGATION LOGIC (Messages Removed) ---
  const searchablePages = [
    { name: 'Dashboard', icon: 'dashboard', path: `/app/${currentUsername}` },
    { name: 'Portfolio', icon: 'tactic', path: `/app/${currentUsername}/portfolio` },
    { name: 'Analytics', icon: 'insights', path: `/app/${currentUsername}/analytics` },
    { name: 'Settings', icon: 'settings', path: `/app/${currentUsername}/settings` },
    { name: 'Support Hub', icon: 'help', path: '/support' },
    { name: 'Privacy Policy', icon: 'security', path: '/privacy' },
    { name: 'Terms of Service', icon: 'gavel', path: '/terms' },
    { name: 'Public Profile', icon: 'public', path: `/${currentUsername}` },
  ];

  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : searchablePages.filter(page => page.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  // Sidebar Items (The first 4: Dashboard, Portfolio, Analytics, Settings)
  const navItems = searchablePages.slice(0, 4); 

  return (
    <div className="app-container">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <ConfirmAlert 
          title="Sign Out"
          message="Are you sure you want to log out of your session? You will need to sign in again to manage your pulse."
          okText="Logout"
          cancelText="Stay logged in"
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <h1 className="sidebar-title">DevPulse</h1>
            <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="sidebar-subtitle">Management Portal</p>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-group">
            {navItems.map((item) => {
              const isActive = currentPage === item.name;
              return (
                <Link key={item.name} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                  <span className="material-symbols-outlined nav-icon">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="sidebar-footer">
            <button className="nav-item logout-btn" onClick={() => setShowLogoutConfirm(true)}>
              <span className="material-symbols-outlined nav-icon">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="breadcrumb">
              <span className="bc-base">DevPulse</span>
              <span className="bc-divider">/</span>
              <span className="bc-current">{currentPage}</span>
            </div>
          </div>

          <div className="topbar-actions">
            
            {/* --- SEARCH COMPONENT --- */}
            <div className="search-wrapper-relative" ref={searchRef}>
              <div className="search-container">
                <span className="material-symbols-outlined search-icon-inline">search</span>
                <input 
                  type="text" 
                  className="topbar-search" 
                  placeholder="Jump to..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => {
                    setShowSearchDropdown(true);
                    if (showNotifs) setShowNotifs(false);
                  }}
                />
              </div>

              {/* Search Dropdown */}
              {showSearchDropdown && searchQuery.trim() !== '' && (
                <div className="search-dropdown animate-fade-in-down">
                  <div className="search-header">
                    <h4>Quick Navigation</h4>
                  </div>
                  <div className="search-body">
                    {searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <div 
                          key={result.name} 
                          className="search-result-item"
                          onClick={() => handleSearchSelect(result.path)}
                        >
                          <div className="search-icon-box">
                            <span className="material-symbols-outlined">{result.icon}</span>
                          </div>
                          <div className="search-content">
                            <p>{result.name}</p>
                            <span>{result.path}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="search-empty">
                        <span className="material-symbols-outlined">search_off</span>
                        <p>No pages found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="action-btns">
              {/* --- NOTIFICATIONS --- */}
              <div className="notif-wrapper" ref={notifRef}>
                <button 
                  className={`icon-btn ${showNotifs ? 'active-icon-btn' : ''}`} 
                  onClick={toggleNotifications}
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && <span className="unread-dot"></span>}
                </button>

                {showNotifs && (
                  <div className="notif-dropdown animate-fade-in-down">
                    <div className="notif-header">
                      <h4>Notifications</h4>
                    </div>
                    <div className="notif-body">
                      {loadingNotifs ? (
                        [1, 2, 3].map(i => (
                          <div key={i} className="notif-item skeleton-row">
                            <div className="skeleton-circle"></div>
                            <div className="skeleton-text-block">
                              <div className="skeleton-line full"></div>
                              <div className="skeleton-line half"></div>
                            </div>
                          </div>
                        ))
                      ) : notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div key={notif._id} className={`notif-item ${!notif.isRead ? 'unread-bg' : ''}`}>
                            <div className={`notif-icon-box type-${notif.type}`}>
                              <span className="material-symbols-outlined">
                                {notif.type === 'success' ? 'check_circle' : notif.type === 'warning' ? 'warning' : 'info'}
                              </span>
                            </div>
                            <div className="notif-content">
                              <p>{notif.message}</p>
                              <span className="notif-time">
                                {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="notif-empty">
                          <span className="material-symbols-outlined">notifications_paused</span>
                          <p>You're all caught up!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button className="icon-btn hide-on-mobile" onClick={() => navigate('/support')}>
                <span className="material-symbols-outlined">help</span>
              </button>

              <div className="avatar-wrapper">
                {loadingAvatar ? (
                  <div className="avatar-skeleton pulse-animation"></div>
                ) : userAvatar ? (
                  <img src={userAvatar} alt="User" className="user-avatar-small" />
                ) : (
                  <div className="user-avatar-small placeholder-avatar">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}