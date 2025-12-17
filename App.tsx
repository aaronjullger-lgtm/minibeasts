import React, { useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastNotification";
import { OverseerGame } from "./components/OverseerGame";
import { OverseerPlayerState } from "./types";
import { characterData } from "./constants";

const AppContent: React.FC = () => {
  // TODO: Replace with actual user authentication and character assignment
  // For now, defaulting to 'eric' character
  const assignedCharacterId = 'eric'; // This will be dynamically set based on logged-in user
  const assignedCharacter = characterData[assignedCharacterId];

  // Initialize player state with assigned character
  const initialOverseerPlayer: OverseerPlayerState = {
    ...assignedCharacter,
    grit: 100,
    loveLife: 50,
    fandom: 50,
    uniqueStatValue: 50,
    energy: 3,
    happiness: 75,
    paSchoolStress: 50,
    insecurity: 50,
    liberalGfSuspicion: 50,
    truckMaintenance: 50,
    ego: 50,
    parlayAddiction: 50,
    commishPower: 50,
    clout: 50,
    unlockedAchievements: [],
    // Overseer-specific properties
    ownedItems: [],
    equippedItems: [],
    activePowerUps: [],
    tradeOffers: [],
    tribunalBets: [],
    squadRideBets: [],
    sportsbookBets: [],
    ambushBets: [],
    ambushTargetBets: [],
    weeklyStats: {
      gritWagered: 0,
      gritWon: 0,
      gritLost: 0,
      betsPlaced: 0,
      betsWon: 0
    }
  };

  const [overseerPlayer] = useState<OverseerPlayerState>(initialOverseerPlayer);

  // No exit handler needed since we go straight to game
  const handleExit = () => {
    // TODO: Implement logout or navigate to profile/settings
    console.log('Exit requested - implement logout');
  };

  return <OverseerGame initialPlayer={overseerPlayer} onExit={handleExit} />;
};

const App: React.FC = () => {
  return (
    <div className="app-grain app-scanlines min-h-screen bg-stadium-gradient">
      <ErrorBoundary>
        <ToastProvider>
          <div className="pb-16 md:pb-0">
            <AppContent />
          </div>
          <nav className="fixed bottom-0 inset-x-0 z-40 bg-black/70 backdrop-blur-md border-t border-board-muted-blue/50 flex justify-around py-3 md:hidden">
            {[
              { label: 'Board', icon: '🎯' },
              { label: 'Wiretap', icon: '📡' },
              { label: 'Locker', icon: '🗄️' },
              { label: 'Trades', icon: '📈' },
              { label: 'Profile', icon: '👤' },
            ].map((item, idx) => (
              <button
                key={item.label}
                className={`flex flex-col items-center gap-1 text-xs font-semibold ${idx === 0 ? 'text-board-red scale-110' : 'text-board-off-white/70'}`}
              >
                <span className={`${idx === 0 ? 'board-red-glow' : ''}`}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </ToastProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
