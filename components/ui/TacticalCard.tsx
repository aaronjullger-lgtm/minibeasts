import React from 'react';

interface TacticalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'alert' | 'gold';
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * TacticalCard - The Standard Content Wrapper (Tactical Luxury Edition)
 * Replaces messy "Locker Room" cards with a consistent, flat, physical look
 * - Background: tactical-panel (#171717)
 * - Border: 1px solid tactical-border (#333333)
 * - No Shadows/Glows: Flat, physical appearance
 * - Corner: Slight rounded corners (rounded-lg)
 * - Interaction: active:bg-[#222] for subtle lighten on press
 */
export const TacticalCard: React.FC<TacticalCardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  onClick,
}) => {
  // Base styles - flat, physical look
  const baseStyles = 'bg-tactical-panel border border-tactical-border rounded-lg p-4 transition-colors duration-200';

  // Variant-specific border colors
  const variantStyles = {
    default: '',
    alert: 'border-alert-orange/50',
    gold: 'border-gold-leaf/50',
  };

  // Interactive styles - subtle lighten on press
  const interactiveStyles = interactive || onClick
    ? 'active:bg-[#222] cursor-pointer'
    : '';

  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`;

  return (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );
};
