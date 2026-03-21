import React, { useEffect, useState } from 'react';

export default function ConfirmAlert({ 
  message, 
  title = "Confirm Action", 
  okText = "Proceed", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleAction = (action) => {
    setIsVisible(false);
    setTimeout(() => {
      if (action === 'confirm') onConfirm();
      if (action === 'cancel') onCancel();
    }, 200);
  };

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '10vh',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.2s ease',
      fontFamily: '"Inter", sans-serif',
    },
    alertBox: {
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    title: {
      fontFamily: '"Manrope", sans-serif',
      fontSize: '1.25rem',
      fontWeight: '800',
      color: '#0F172A',
      marginBottom: '8px'
    },
    message: {
      fontSize: '0.875rem',
      color: '#64748B',
      marginBottom: '24px',
      lineHeight: '1.5'
    },
    buttonRow: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    },
    btnCancel: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: '1px solid #E2E8F0',
      backgroundColor: '#F8FAFC',
      color: '#475569',
      fontWeight: '600',
      fontSize: '0.875rem',
      cursor: 'pointer'
    },
    btnConfirm: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#4648D4',
      color: '#ffffff',
      fontWeight: '600',
      fontSize: '0.875rem',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.alertBox}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttonRow}>
          <button style={styles.btnCancel} onClick={() => handleAction('cancel')}>{cancelText}</button>
          <button style={styles.btnConfirm} onClick={() => handleAction('confirm')}>{okText}</button>
        </div>
      </div>
    </div>
  );
}