import React from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

/**
 * BottomNav - A glitch-free navigation bar with haptic feedback
 * Floating island style with active state glow and tactile interactions
 */
export const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeTab,
  onTabChange,
  className = '',
}) => {
  const handleTabClick = (tabId: string) => {
    // Trigger haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onTabChange(tabId);
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 pb-safe ${className}`}
    >
      <div className="mx-auto max-w-5xl px-4 pb-4">
        <div className="glass-panel rounded-2xl shadow-2xl">
          <div className="flex items-center justify-around px-2 py-3">
            {items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                    transition-all duration-300 active:scale-95
                    ${isActive
                      ? 'text-board-text scale-105'
                      : 'text-board-text/60 hover:text-board-text/80'
                    }
                  `}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className={`
                      text-2xl transition-all duration-300
                      ${isActive ? 'drop-shadow-[0_0_8px_rgba(226,232,240,0.6)]' : ''}
                    `}
                  >
                    {item.icon}
                  </span>
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-board-text rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
