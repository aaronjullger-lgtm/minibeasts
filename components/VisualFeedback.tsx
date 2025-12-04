import React from 'react';

/**
 * Component to display floating stat changes
 */
export const StatChange: React.FC<{
  value: number;
  stat: string;
  color?: string;
}> = ({ value, stat, color }) => {
  const isPositive = value > 0;
  const displayColor = color || (isPositive ? 'text-green-400' : 'text-red-400');

  return (
    <div className={`absolute animate-bounce-in ${displayColor} font-bold text-lg pointer-events-none z-50`}>
      {isPositive ? '+' : ''}{value} {stat}
    </div>
  );
};

/**
 * Component for achievement unlock notification
 */
export const AchievementUnlock: React.FC<{
  name: string;
  description: string;
  onClose: () => void;
}> = ({ name, description, onClose }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-4 rounded-xl shadow-2xl border-2 border-yellow-400 max-w-md">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🏆</div>
          <div className="flex-1">
            <div className="font-bold text-lg">Achievement Unlocked!</div>
            <div className="font-semibold">{name}</div>
            <div className="text-sm text-yellow-100">{description}</div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-yellow-200 text-2xl leading-none font-bold"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Pulsing indicator for important actions
 */
export const PulseIndicator: React.FC<{
  children: React.ReactNode;
  color?: string;
}> = ({ children, color = 'bg-blue-500' }) => {
  return (
    <div className="relative">
      {children}
      <span className={`absolute top-0 right-0 flex h-3 w-3`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
      </span>
    </div>
  );
};

/**
 * Progress bar component
 */
export const ProgressBar: React.FC<{
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  animate?: boolean;
}> = ({
  current,
  max,
  label,
  showPercentage = false,
  color = 'bg-blue-500',
  animate = true
}) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm text-slate-300 mb-1">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} ${animate ? 'transition-all duration-500' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Tooltip component
 */
export const Tooltip: React.FC<{
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ children, content, position = 'top' }) => {
  const [show, setShow] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className={`absolute ${positionClasses[position]} z-50 animate-fade-in`}>
          <div className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-slate-700 whitespace-nowrap">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Confirmation dialog
 */
export const ConfirmDialog: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-3xl max-w-md w-full border-2 border-slate-700 shadow-2xl animate-bounce-in">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-slate-100 mb-3">{title}</h3>
          <p className="text-slate-300 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition-colors ${
                danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Badge component for notifications
 */
export const Badge: React.FC<{
  count: number;
  max?: number;
  color?: string;
}> = ({ count, max = 99, color = 'bg-red-500' }) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={`absolute -top-1 -right-1 ${color} text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1`}
    >
      {displayCount}
    </span>
  );
};
