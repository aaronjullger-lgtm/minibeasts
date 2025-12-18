import React, { useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastNotification";
import { OverseerGame } from "./components/OverseerGame";
import { TheDossier } from "./components/TheDossier";
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
  const [playerSnapshot, setPlayerSnapshot] = useState<OverseerPlayerState>(initialOverseerPlayer);
  const [isLockdown, setIsLockdown] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('board');

  // No exit handler needed since we go straight to game
  const handleExit = () => {
    // TODO: Implement logout or navigate to profile/settings
    console.log('Exit requested - implement logout');
  };

  return (
    <div style={isLockdown ? { filter: 'grayscale(100%)' } : undefined}>
      {/* The HUD (Heads-Up Display) - Fixed at top */}
      <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur-xl bg-board-navy/80 border-b border-board-muted-blue">
        {/* Left: Season/Phase */}
        <div className="text-[10px] uppercase tracking-widest text-board-off-white/60 font-board-grit">
          SEASON 1 • PHASE 3
        </div>
        
        {/* Right: Grit Balance */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-board-off-white/60 uppercase tracking-wider">GRIT</span>
          <span className="text-2xl font-board-grit font-bold text-board-red tracking-tight">
            {overseerPlayer.grit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Content Area - with padding for HUD and bottom nav */}
      <div className={`pt-16 ${isLockdown ? 'pb-4' : 'pb-24'} relative`}>
        <OverseerGame 
          initialPlayer={overseerPlayer} 
          onExit={handleExit}
          onPlayerUpdate={setPlayerSnapshot}
          onLockdownChange={setIsLockdown}
        />

        {activeTab === 'profile' && (
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md overflow-y-auto p-4 md:p-8">
            <TheDossier player={playerSnapshot} onClose={() => setActiveTab('board')} />
          </div>
        )}
      </div>

      {/* The Bottom Nav - Fixed at bottom */}
      {!isLockdown && (
        <nav className="fixed bottom-0 inset-x-0 z-50 h-20 bg-board-navy backdrop-blur-xl border-t border-board-muted-blue flex items-center justify-around px-2">
          {[
            { id: 'locker', label: 'Locker Room', icon: '🗄️' },
            { id: 'board', label: 'The Board', icon: '🎯' },
            { id: 'squad', label: 'My Squad', icon: '👥' },
            { id: 'profile', label: 'Profile', icon: '👤' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1 min-w-[60px] py-2 transition-all duration-200"
              >
                <div className="relative">
                  <span 
                    className={`text-2xl transition-all duration-200 ${
                      isActive 
                        ? 'text-board-red scale-110 filter drop-shadow-[0_0_8px_rgba(255,51,51,0.8)]' 
                        : 'text-board-off-white opacity-60'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  {/* Active indicator dot */}
                  {isActive && (
                    <div 
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-board-red"
                      style={{ boxShadow: '0 0 6px rgba(255, 51, 51, 0.8)' }}
                    />
                  )}
                </div>
                <span 
                  className={`text-[10px] uppercase tracking-wider font-medium transition-all duration-200 ${
                    isActive 
                      ? 'text-board-red font-bold' 
                      : 'text-board-off-white/60'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-board-navy">
      <ErrorBoundary>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
