'use client';

import React, { useRef, useState } from 'react';
import styles from './HoverGlowButton.module.css';

export function HoverGlowButton({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  glowColor = '#3b82f6',
  backgroundColor = 'rgba(255, 255, 255, 0.05)',
  textColor = '#ffffff',
  hoverTextColor = '#93c5fd'
}) {
  const buttonRef = useRef(null);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setGlowPosition({ x, y });
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${styles.hoverButton} ${disabled ? styles.disabled : ''} ${className}`}
      style={{
        backgroundColor: backgroundColor,
        color: isHovered ? hoverTextColor : textColor,
      }}
    >
      <div
        className={`${styles.glowDiv} ${isHovered ? styles.glowActive : ''}`}
        style={{
          left: `${glowPosition.x}px`,
          top: `${glowPosition.y}px`,
          background: `radial-gradient(circle, ${glowColor} 10%, transparent 70%)`,
        }}
      />
      <span className={styles.content}>{children}</span>
    </button>
  );
}
