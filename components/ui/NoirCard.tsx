import React from 'react';

interface NoirCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'alert' | 'gold';
  interactive?: boolean;
  className?: string;
}

/**
 * NoirCard - A reusable card component with glassmorphism effect
 * Ensures consistent visual appearance across the application
 */
export const NoirCard: React.FC<NoirCardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
}) => {
  // Base styles - glassmorphism effect
  const baseStyles = 'glass-panel rounded-2xl p-4 transition-all duration-300';

  // Variant-specific styles
  const variantStyles = {
    default: 'border-board-highlight/20',
    alert: 'border-board-red/30 shadow-board-red/10',
    gold: 'border-board-gold/30 shadow-board-gold/10',
  };

  // Interactive styles
  const interactiveStyles = interactive
    ? 'hover:border-board-highlight/40 active:scale-[0.98] cursor-pointer'
    : '';

  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`;

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};
