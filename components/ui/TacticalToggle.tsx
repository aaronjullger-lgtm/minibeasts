/**
 * TacticalToggle Component
 * A mechanical toggle switch with a physical hardware feel
 * Part of the "Tactical Luxury" design system
 */

import React from 'react';

interface TacticalToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const TacticalToggle: React.FC<TacticalToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Toggle Container */}
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 ease-in-out
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
        style={{
          backgroundColor: '#222',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Thumb */}
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full
            transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-6' : 'translate-x-1'}
            ${disabled ? '' : 'active:scale-95'}
          `}
          style={{
            background: checked
              ? 'linear-gradient(135deg, #E5E5E5 0%, #B8B8B8 50%, #E5E5E5 100%)'
              : '#F5F5F5',
            boxShadow: checked
              ? '0 1px 3px rgba(0, 0, 0, 0.5)'
              : '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        />

        {/* LED Indicator - Shows when active */}
        {checked && (
          <span
            className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: '#F97316',
              boxShadow: '0 0 4px #F97316, 0 0 8px rgba(249, 115, 22, 0.5)',
            }}
          />
        )}
      </button>

      {/* Label */}
      {label && (
        <span className="text-sm text-paper-white select-none">
          {label}
        </span>
      )}
    </div>
  );
};
