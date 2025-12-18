import React, { useState } from 'react';
import { ScreenShell } from './components/layout/ScreenShell';
import { BottomNav } from './components/layout/BottomNav';
import { NoirCard } from './components/ui/NoirCard';

/**
 * Example Usage - Core UI Architecture Components
 * 
 * This file demonstrates how to use the new layout system:
 * - ScreenShell: Provides the bug-free layout structure
 * - BottomNav: Navigation bar with haptic feedback
 * - NoirCard: Reusable card component with glassmorphism
 */

const ExampleApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'games', label: 'Games', icon: '🎮' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <ScreenShell
      header={
        <div className="glass-panel px-4 py-3">
          <h1 className="text-xl font-bold text-board-text">Mini Beasts</h1>
        </div>
      }
      footer={
        <BottomNav
          items={navItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      }
    >
      <div className="p-4 space-y-4">
        {/* Example: Default Card */}
        <NoirCard>
          <h2 className="text-lg font-semibold text-board-text mb-2">
            Default Card
          </h2>
          <p className="text-board-text/70 text-sm">
            This is a default card with the glassmorphism effect.
          </p>
        </NoirCard>

        {/* Example: Interactive Card */}
        <NoirCard interactive>
          <h2 className="text-lg font-semibold text-board-text mb-2">
            Interactive Card
          </h2>
          <p className="text-board-text/70 text-sm">
            Click this card to see the interactive effect (hover and active states).
          </p>
        </NoirCard>

        {/* Example: Alert Card */}
        <NoirCard variant="alert">
          <h2 className="text-lg font-semibold text-board-red mb-2">
            Alert Card
          </h2>
          <p className="text-board-text/70 text-sm">
            This card uses the alert variant with red accent borders.
          </p>
        </NoirCard>

        {/* Example: Gold Card */}
        <NoirCard variant="gold">
          <h2 className="text-lg font-semibold text-board-gold mb-2">
            Gold Card
          </h2>
          <p className="text-board-text/70 text-sm">
            This card uses the gold variant for premium/winning content.
          </p>
        </NoirCard>

        {/* Example: Custom Styled Card */}
        <NoirCard interactive className="bg-gradient-to-br from-board-surface to-board-highlight">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏆</div>
            <div>
              <h2 className="text-lg font-semibold text-board-gold mb-1">
                Premium Feature
              </h2>
              <p className="text-board-text/70 text-sm">
                Cards can be customized with additional className props.
              </p>
            </div>
          </div>
        </NoirCard>

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>
    </ScreenShell>
  );
};

export default ExampleApp;
