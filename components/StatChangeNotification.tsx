import React, { useState, useEffect } from 'react';

export interface StatChange {
  stat: string;
  value: number;
  icon?: string;
  color?: string;
}

export interface StatChangeNotificationProps {
  change: StatChange;
  onClose: () => void;
}

export const StatChangeNotification: React.FC<StatChangeNotificationProps> = ({
  change,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 2000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  const isPositive = change.value > 0;
  const defaultColor = isPositive ? 'text-green-400' : 'text-red-400';
  const color = change.color || defaultColor;
  const icon = change.icon || (isPositive ? '↑' : '↓');

  return (
    <div
      className={`fixed top-20 right-4 z-40 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`glass-effect-light rounded-xl px-4 py-2 border ${
        isPositive ? 'border-green-500/50' : 'border-red-500/50'
      } shadow-lg animate-bounce-in`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-medium text-slate-200">{change.stat}</span>
          <span className={`text-lg font-bold ${color}`}>
            {isPositive ? '+' : ''}{change.value}
          </span>
        </div>
      </div>
    </div>
  );
};

export const StatChangeQueue: React.FC<{
  changes: StatChange[];
  onClearChange: (index: number) => void;
}> = ({ changes, onClearChange }) => {
  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col gap-2">
      {changes.map((change, index) => (
        <div key={`${change.stat}-${index}`} style={{ marginTop: `${index * 60}px` }}>
          <StatChangeNotification
            change={change}
            onClose={() => onClearChange(index)}
          />
        </div>
      ))}
    </div>
  );
};

export const FloatingStatChange: React.FC<{
  change: StatChange;
  x: number;
  y: number;
}> = ({ change, x, y }) => {
  const isPositive = change.value > 0;
  
  return (
    <div
      className="fixed z-50 pointer-events-none animate-float-up"
      style={{
        left: x,
        top: y
      }}
    >
      <div className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{change.value}
      </div>
    </div>
  );
};
