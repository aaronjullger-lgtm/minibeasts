import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile, RiskProfile } from '../types';
import { getRiskProfileIcon } from '../services/profileService';

interface IdentityCardProps {
  userName: string;
  userProfile?: UserProfile;
  size?: 'small' | 'medium' | 'large';
  showBadge?: boolean;
  onClick?: () => void;
  className?: string;
}

export const IdentityCard: React.FC<IdentityCardProps> = ({
  userName,
  userProfile,
  size = 'medium',
  showBadge = true,
  onClick,
  className = ''
}) => {
  const hasAscended = userProfile?.hasAscended || false;
  const riskProfile = userProfile?.riskProfile;
  const latestPrestige = userProfile?.prestigeLevels?.[userProfile.prestigeLevels.length - 1];

  // Size variants
  const sizeClasses = {
    small: {
      container: 'text-xs',
      name: 'text-sm',
      icon: 'w-4 h-4',
      badge: 'text-[8px] px-1 py-0.5'
    },
    medium: {
      container: 'text-sm',
      name: 'text-base',
      icon: 'w-5 h-5',
      badge: 'text-[10px] px-2 py-1'
    },
    large: {
      container: 'text-base',
      name: 'text-xl',
      icon: 'w-6 h-6',
      badge: 'text-xs px-3 py-1'
    }
  };

  const sizeConfig = sizeClasses[size];

  // Get risk profile icon
  const getRiskIcon = () => {
    if (!riskProfile) return null;
    
    const iconMap: Record<string, string> = {
      Calculator: '📊',
      Skull: '💀',
      Wolf: '🐺'
    };
    
    return iconMap[riskProfile.icon] || '⚡';
  };

  return (
    <div
      className={`inline-flex items-center gap-2 ${sizeConfig.container} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Nameplate with holographic effect if ascended */}
      <motion.div
        className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded ${
          hasAscended
            ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-[length:200%_200%]'
            : 'bg-board-muted-blue'
        }`}
        animate={
          hasAscended
            ? {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }
            : {}
        }
        transition={
          hasAscended
            ? {
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }
            : {}
        }
        whileHover={onClick ? { scale: 1.05 } : {}}
      >
        {/* Inner content with dark background for readability */}
        <div className={`flex items-center gap-2 ${hasAscended ? 'bg-board-navy/80 px-2 py-1 rounded' : ''}`}>
          {/* Risk profile icon */}
          {riskProfile && (
            <span 
              className={sizeConfig.icon}
              title={riskProfile.name}
            >
              {getRiskIcon()}
            </span>
          )}

          {/* Username */}
          <span className={`font-bold text-board-off-white ${sizeConfig.name}`}>
            {userName}
          </span>

          {/* Prestige badge */}
          {showBadge && latestPrestige && (
            <span 
              className={`${sizeConfig.badge} bg-yellow-600 text-black font-bold rounded uppercase tracking-tight`}
              title={`${latestPrestige.badge} - ${latestPrestige.multiplier}x multiplier`}
            >
              S{latestPrestige.season}
            </span>
          )}
        </div>
      </motion.div>

      {/* Hover tooltip for risk profile */}
      {riskProfile && (
        <style jsx>{`
          .risk-profile-tooltip {
            visibility: hidden;
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: black;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            margin-bottom: 8px;
          }
          
          .risk-profile-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 5px solid transparent;
            border-top-color: black;
          }
          
          .identity-card-wrapper:hover .risk-profile-tooltip {
            visibility: visible;
          }
        `}</style>
      )}
    </div>
  );
};

// Standalone component for displaying just the risk profile badge
export const RiskProfileBadge: React.FC<{ riskProfile: RiskProfile; size?: 'small' | 'medium' | 'large' }> = ({
  riskProfile,
  size = 'medium'
}) => {
  const iconMap: Record<string, string> = {
    Calculator: '📊',
    Skull: '💀',
    Wolf: '🐺'
  };

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 bg-board-muted-blue border border-board-off-white/20 rounded ${sizeClasses[size]}`}
      title={riskProfile.description}
    >
      <span>{iconMap[riskProfile.icon] || '⚡'}</span>
      <span className="font-bold text-board-off-white">{riskProfile.name}</span>
    </div>
  );
};

// Standalone component for displaying prestige badge
export const PrestigeBadge: React.FC<{ season: number; multiplier: number }> = ({
  season,
  multiplier
}) => {
  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-black px-3 py-1 rounded font-bold text-sm">
      <span>✨</span>
      <span>S{season} Survivor</span>
      <span className="text-xs">({multiplier}x)</span>
    </div>
  );
};

export default IdentityCard;
