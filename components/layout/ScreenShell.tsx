import React from 'react';

interface ScreenShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * ScreenShell - The Layout Engine (Tactical Luxury Edition)
 * Provides a rigid, bug-free layout container that prevents layout shifts
 * - Fixed Header: 60px height, z-50, glass effect with backdrop-blur-xl
 * - ScrollArea: Absolute positioning, scrollable content with pb-safe for iPhone
 * - Fixed Bottom Nav: 80px height, z-50, border-top with tactical-border
 */
export const ScreenShell: React.FC<ScreenShellProps> = ({
  children,
  header,
  footer,
  className = '',
}) => {
  return (
    <div className={`flex flex-col h-screen w-full bg-tactical-dark ${className}`}>
      {/* Fixed Header - 60px, Glass Effect */}
      {header && (
        <header 
          className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-xl bg-tactical-dark/80 border-b border-tactical-border pt-safe"
          style={{ height: '60px' }}
        >
          {header}
        </header>
      )}

      {/* Scrollable Content Area - Absolute Positioning */}
      <main
        className={`absolute left-0 right-0 overflow-y-auto overflow-x-hidden pb-safe ${header ? 'top-16' : 'top-0'} ${footer ? 'bottom-20' : 'bottom-0'}`}
        style={{
          overscrollBehaviorY: 'none', // Prevent rubber band effect on iOS
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        }}
      >
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* Fixed Bottom Nav - 80px, Tactical Border */}
      {footer && (
        <footer 
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-tactical-border bg-tactical-dark"
          style={{ height: '80px' }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
};
