import React from 'react';
import { Achievement } from '../types';
import { AchievementNotification } from './AchievementNotification';
import { StatChangeNotification, StatChange } from './StatChangeNotification';

/**
 * Queue wrapper for Achievement Notifications
 */
export const AchievementQueue: React.FC<{
  achievements: Achievement[];
  onDismiss: (id: string) => void;
}> = ({ achievements, onDismiss }) => {
  // Show only the first achievement in the queue
  const current = achievements[0];
  
  if (!current) return null;
  
  return (
    <AchievementNotification
      achievement={current}
      onClose={() => onDismiss(current.id)}
    />
  );
};

/**
 * Queue wrapper for Stat Change Notifications
 */
export const StatChangeQueue: React.FC<{
  changes: Array<StatChange & { id: string }>;
  onDismiss: (id: string) => void;
}> = ({ changes, onDismiss }) => {
  // Show only the first change in the queue
  const current = changes[0];
  
  if (!current) return null;
  
  return (
    <StatChangeNotification
      change={{
        stat: current.stat,
        value: current.value,
        icon: current.icon,
        color: current.color
      }}
      onClose={() => onDismiss(current.id)}
    />
  );
};
