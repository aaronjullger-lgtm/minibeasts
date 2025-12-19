import React from 'react';

/**
 * Typography System - Tactical Luxury Edition
 * Strict text control for the "Mini Beasts" UI
 * Raw <p> tags are banned. Use these components instead.
 */

interface MonoProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Mono - For ALL numbers (Grit, Prices, Odds)
 * Features tabular-nums to ensure vertical alignment
 */
export const Mono: React.FC<MonoProps> = ({ children, className = '' }) => {
  return (
    <span 
      className={`font-mono tracking-tighter text-paper-white ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {children}
    </span>
  );
};

interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Label - For metadata (e.g., "DROP RATE", "COST")
 */
export const Label: React.FC<LabelProps> = ({ children, className = '' }) => {
  return (
    <span className={`text-[10px] uppercase tracking-widest text-muted-text font-bold ${className}`}>
      {children}
    </span>
  );
};

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Header - For card titles
 */
export const Header: React.FC<HeaderProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`font-sans font-bold text-lg text-paper-white leading-none ${className}`}>
      {children}
    </h3>
  );
};
