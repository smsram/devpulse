import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'error', onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to allow CSS transition to register
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    const autoCloseTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out before unmounting
    }, 4000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [onClose]);

  const handleManualClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const styles = {
    wrapper: {
      position: 'fixed',
      top: '100px',
      right: '24px',
      zIndex: 99999, // Ensure it's above everything
      backgroundColor: type === 'error' ? 'var(--error-container)' : 'var(--surface-container-lowest)',
      color: type === 'error' ? 'var(--on-error-container)' : 'var(--on-surface)',
      border: `1px solid ${type === 'error' ? 'var(--error)' : 'var(--primary)'}`,
      padding: '12px 16px 12px 20px',
      borderRadius: '12px',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      minWidth: '300px',
      maxWidth: 'calc(100vw - 48px)',
      
      // FIXED ANIMATION: Fade and drop instead of sliding horizontally
      transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      
      fontFamily: 'var(--font-body)',
      fontSize: '0.9rem',
      fontWeight: '600',
      pointerEvents: 'auto'
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    icon: {
      fontSize: '22px',
      color: type === 'error' ? 'var(--error)' : '#10B981',
      fontVariationSettings: "'FILL' 1"
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--outline)',
      borderRadius: '6px',
      transition: 'background 0.2s',
      flexShrink: 0
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.content}>
        <span className="material-symbols-outlined" style={styles.icon}>
          {type === 'error' ? 'error' : 'check_circle'}
        </span>
        <span style={{ lineHeight: '1.4' }}>{message}</span>
      </div>
      
      <button 
        style={styles.closeBtn} 
        onClick={handleManualClose}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          close
        </span>
      </button>
    </div>
  );
}