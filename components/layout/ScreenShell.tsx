import React from 'react';

interface ScreenShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * ScreenShell - The Layout Engine
 * Provides a rigid, bug-free layout with fixed header/footer and scrollable content
 * Prevents mobile scroll issues with proper overscroll behavior
 */
export const ScreenShell: React.FC<ScreenShellProps> = ({
  children,
  header,
  footer,
  className = '',
}) => {
  return (
    <div className={`flex flex-col h-screen w-full bg-board-navy ${className}`}>
      {/* Fixed Top Bar */}
      {header && (
        <header className="fixed top-0 left-0 right-0 z-50 pt-safe">
          {header}
        </header>
      )}

      {/* Scrollable Main Area */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          overscrollBehaviorY: 'none', // Prevent rubber band effect on iOS
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          marginTop: header ? 'var(--header-height, 4rem)' : '0',
          marginBottom: footer ? 'var(--footer-height, 5rem)' : '0',
        }}
      >
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* Fixed Bottom Nav */}
      {footer && (
        <footer className="fixed bottom-0 left-0 right-0 z-50">
          {footer}
        </footer>
      )}
    </div>
  );
};
