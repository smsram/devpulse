import React from 'react';

export default function Loader({ fullPage = false, size = '20px', color = 'currentColor' }) {
  const loaderStyle = {
    width: size,
    height: size,
    border: `3px solid ${color}33`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  };

  const wrapperStyle = fullPage ? {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(4px)',
    zIndex: 10000
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={wrapperStyle}>
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
      </style>
      <div style={loaderStyle}></div>
    </div>
  );
}