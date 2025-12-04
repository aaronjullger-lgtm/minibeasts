import React, { useState, useEffect } from 'react';
import { Achievement } from '../types';

export interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setTimeout(() => setIsVisible(true), 100);

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="glass-effect rounded-2xl p-4 border-2 border-amber-500/50 min-w-[320px] max-w-md pulse-glow animate-bounce-in">
        <div className="flex items-start gap-3">
          <div className="text-4xl animate-wiggle">🏆</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-amber-300 font-bold text-sm">Achievement Unlocked!</h3>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="ml-auto text-slate-400 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
            <h4 className="text-white font-semibold text-base mb-1">{achievement.name}</h4>
            <p className="text-slate-300 text-xs leading-relaxed">{achievement.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AchievementQueue: React.FC<{ 
  achievements: Achievement[];
  onClearAchievement: (index: number) => void;
}> = ({ achievements, onClearAchievement }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {achievements.map((achievement, index) => (
        <AchievementNotification
          key={`${achievement.id}-${index}`}
          achievement={achievement}
          onClose={() => onClearAchievement(index)}
        />
      ))}
    </div>
  );
};
