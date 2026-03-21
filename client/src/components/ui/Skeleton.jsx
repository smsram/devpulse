import React from 'react';

export default function Skeleton({ 
  width = '100%', 
  height = '20px', 
  variant = 'rectangular', // 'text', 'circular', 'rectangular'
  style = {} 
}) {
  
  // Base styles for the shimmer effect
  const baseStyle = {
    display: 'block',
    width: width,
    height: height,
    backgroundColor: 'var(--surface-container-high)',
    backgroundImage: `linear-gradient(
      90deg, 
      var(--surface-container-high) 0px, 
      rgba(255, 255, 255, 0.6) 50%, 
      var(--surface-container-high) 100%
    )`,
    backgroundSize: '200% 100%',
    animation: 'shimmer-pulse 1.5s infinite linear',
    ...style
  };

  // Border radius logic based on variant
  if (variant === 'circular') {
    baseStyle.borderRadius = '50%';
  } else if (variant === 'text') {
    baseStyle.borderRadius = '4px';
    baseStyle.height = height === '20px' ? '1rem' : height; // Default text height
    baseStyle.marginBottom = '0.5rem';
  } else {
    baseStyle.borderRadius = '12px'; // Matches your site's card radius
  }

  return (
    <>
      <style>
        {`
          @keyframes shimmer-pulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
      <div style={baseStyle} />
    </>
  );
}