import React, { ReactNode } from 'react';

interface BaseButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

/**
 * Primary action button with glow effect
 */
export const PrimaryButton: React.FC<BaseButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative overflow-hidden
        px-6 py-3 rounded-xl
        bg-gradient-to-r from-blue-600 to-blue-500
        hover:from-blue-500 hover:to-blue-400
        text-white font-bold text-sm
        shadow-lg hover:shadow-blue-500/50
        transition-all duration-300
        hover:-translate-y-1 hover:scale-105
        active:translate-y-0 active:scale-100
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ripple
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
    </button>
  );
};

/**
 * Secondary button with border glow
 */
export const SecondaryButton: React.FC<BaseButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl
        bg-slate-800/80 hover:bg-slate-700/80
        border-2 border-slate-600 hover:border-blue-500
        text-slate-100 hover:text-white font-semibold text-sm
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
        active:translate-y-0 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

/**
 * Success/positive action button
 */
export const SuccessButton: React.FC<BaseButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group px-6 py-3 rounded-xl
        bg-gradient-to-r from-green-600 to-emerald-600
        hover:from-green-500 hover:to-emerald-500
        text-white font-bold text-sm
        shadow-lg hover:shadow-green-500/50
        transition-all duration-300
        hover:-translate-y-1 hover:scale-105
        active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      <span className="flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

/**
 * Danger/destructive action button
 */
export const DangerButton: React.FC<BaseButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl
        bg-gradient-to-r from-red-600 to-rose-600
        hover:from-red-500 hover:to-rose-500
        text-white font-bold text-sm
        shadow-lg hover:shadow-red-500/50
        transition-all duration-300
        hover:-translate-y-1 hover:scale-105
        active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed
        animate-pulse-slow
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

/**
 * Icon button for compact actions
 */
export const IconButton: React.FC<BaseButtonProps & { icon: string; label?: string }> = ({
  icon,
  label,
  onClick,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`
        p-3 rounded-xl
        bg-slate-800/60 hover:bg-slate-700
        border border-slate-700 hover:border-blue-500
        text-2xl
        transition-all duration-200
        hover:scale-110 hover:-translate-y-1
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {icon}
    </button>
  );
};

/**
 * Floating action button
 */
export const FloatingButton: React.FC<BaseButtonProps & { icon: string }> = ({
  icon,
  children,
  onClick,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        fixed bottom-6 right-6 z-40
        flex items-center gap-3
        px-6 py-4 rounded-full
        bg-gradient-to-r from-purple-600 to-pink-600
        hover:from-purple-500 hover:to-pink-500
        text-white font-bold
        shadow-2xl hover:shadow-purple-500/50
        transition-all duration-300
        hover:scale-110 hover:-translate-y-2
        active:scale-100
        animate-float
        ${className}
      `}
    >
      <span className="text-2xl">{icon}</span>
      {children && <span>{children}</span>}
    </button>
  );
};

/**
 * Tab button for navigation
 */
export const TabButton: React.FC<BaseButtonProps & { active?: boolean }> = ({
  children,
  onClick,
  active = false,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 px-4 py-3 rounded-xl
        font-semibold text-sm
        transition-all duration-300
        hover:scale-105
        ${
          active
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:text-white'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

/**
 * Pill button for tags/filters
 */
export const PillButton: React.FC<BaseButtonProps & { active?: boolean; icon?: string }> = ({
  children,
  icon,
  onClick,
  active = false,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2
        px-4 py-2 rounded-full
        text-xs font-semibold
        transition-all duration-200
        hover:scale-105 hover:-translate-y-0.5
        ${
          active
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
        }
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

/**
 * Card button for large clickable areas
 */
export const CardButton: React.FC<BaseButtonProps & { icon?: string; subtitle?: string }> = ({
  children,
  icon,
  subtitle,
  onClick,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative
        flex flex-col items-center gap-3
        p-6 rounded-2xl
        bg-slate-900/60 hover:bg-slate-800/80
        border-2 border-slate-700/50 hover:border-blue-500/70
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20
        active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {icon && (
        <div className="text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:animate-wiggle">
          {icon}
        </div>
      )}
      <div className="text-center">
        <div className="font-bold text-lg text-slate-100 group-hover:text-white">
          {children}
        </div>
        {subtitle && (
          <div className="text-sm text-slate-400 mt-1 group-hover:text-slate-300">
            {subtitle}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
    </button>
  );
};

/**
 * Gritty action button (themed for the game)
 */
export const GritButton: React.FC<BaseButtonProps & { gritCost?: number }> = ({
  children,
  gritCost,
  onClick,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative overflow-hidden
        px-6 py-3 rounded-xl
        bg-gradient-to-r from-amber-600 to-orange-600
        hover:from-amber-500 hover:to-orange-500
        text-white font-bold text-sm
        shadow-lg hover:shadow-amber-500/50
        transition-all duration-300
        hover:-translate-y-1 hover:scale-105
        active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        <span className="text-lg">💪</span>
        {children}
        {gritCost && (
          <span className="ml-2 px-2 py-0.5 rounded-full bg-black/30 text-xs">
            -{gritCost} GRIT
          </span>
        )}
      </span>
      <div className="absolute inset-0 shimmer" />
    </button>
  );
};
