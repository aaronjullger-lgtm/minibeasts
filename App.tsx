import React, { useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastNotification";
import { OverseerGame } from "./components/OverseerGame";
import { TheDossier } from "./components/TheDossier";
import { LockerRoom } from "./components/locker/LockerRoom";
import { OverseerPlayerState, OperationType } from "./types";
import { characterData } from "./constants";
import { ScreenShell } from "./components/layout/ScreenShell";
import { Label, Mono } from "./components/ui/Typography";

const AppContent: React.FC = () => {
  // TODO: Replace with actual user authentication and character assignment
  // For now, defaulting to 'eric' character
  const assignedCharacterId = 'eric'; // This will be dynamically set based on logged-in user
  const assignedCharacter = characterData[assignedCharacterId];

  // Initialize player state with assigned character
  const initialOverseerPlayer: OverseerPlayerState = {
    ...assignedCharacter,
    grit: 10000, // Starting with more grit for demo
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

  const [overseerPlayer, setOverseerPlayer] = useState<OverseerPlayerState>(initialOverseerPlayer);
  const [playerSnapshot, setPlayerSnapshot] = useState<OverseerPlayerState>(initialOverseerPlayer);
  const [isLockdown, setIsLockdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'locker' | 'profile'>('board');
  const [showLockerRoom, setShowLockerRoom] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Handle player updates from child components
  const handlePlayerUpdate = (updatedPlayer: OverseerPlayerState) => {
    setOverseerPlayer(updatedPlayer);
    setPlayerSnapshot(updatedPlayer);
  };

  // Handle operation execution from Black Ledger
  const handleOperationExecuted = (operation: OperationType, cost: number) => {
    setOverseerPlayer(prev => ({
      ...prev,
      grit: prev.grit - cost
    }));
  };

  // Handle mystery box purchases
  const handleMysteryBoxPurchase = (tierId: string, cost: number, pulledItem: any) => {
    setOverseerPlayer(prev => ({
      ...prev,
      grit: prev.grit - cost,
      ownedItems: [...prev.ownedItems, pulledItem]
    }));
  };

  // No exit handler needed since we go straight to game
  const handleExit = () => {
    // TODO: Implement logout or navigate to profile/settings
    console.log('Exit requested - implement logout');
  };

  // Tactical header component
  const header = (
    <div className="flex items-center justify-between h-full px-4">
      <div className="flex items-center gap-4">
        <Label className="text-muted-text">SEASON 1 • PHASE 3</Label>
      </div>
      
      <div className="flex items-center gap-2">
        <Label>GRIT</Label>
        <Mono className="text-2xl text-alert-orange">{overseerPlayer.grit.toLocaleString()}</Mono>
      </div>
    </div>
  );

  // Tactical bottom navigation
  const footer = !isLockdown ? (
    <nav className="flex items-center justify-around h-full px-2">
      {[
        { id: 'board', label: 'Board', icon: '🎯' },
        { id: 'locker', label: 'Locker', icon: '🗄️' },
        { id: 'profile', label: 'Profile', icon: '👤' },
      ].map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as 'board' | 'locker' | 'profile');
              if (tab.id === 'locker') {
                setShowLockerRoom(true);
              } else if (tab.id === 'profile') {
                setShowProfile(true);
              } else {
                setShowLockerRoom(false);
                setShowProfile(false);
              }
            }}
            className="flex flex-col items-center gap-1 min-w-[60px] py-2 transition-all duration-200"
          >
            <div className="relative">
              <span 
                className={`text-2xl transition-all duration-200 ${
                  isActive 
                    ? 'text-alert-orange scale-110 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' 
                    : 'text-paper-white opacity-60'
                }`}
              >
                {tab.icon}
              </span>
              {isActive && (
                <div 
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-alert-orange"
                  style={{ boxShadow: '0 0 6px rgba(249, 115, 22, 0.8)' }}
                />
              )}
            </div>
            <Label 
              className={`${
                isActive 
                  ? 'text-alert-orange' 
                  : 'text-muted-text'
              }`}
            >
              {tab.label}
            </Label>
          </button>
        );
      })}
    </nav>
  ) : null;

  return (
    <div className="min-h-screen bg-tactical-dark">
      {activeTab === 'board' && !showLockerRoom && !showProfile && (
        <ScreenShell header={header} footer={footer}>
          <OverseerGame 
            initialPlayer={overseerPlayer} 
            onExit={handleExit}
            onPlayerUpdate={handlePlayerUpdate}
            onLockdownChange={setIsLockdown}
          />
        </ScreenShell>
      )}

      {/* Locker Room Overlay */}
      {showLockerRoom && (
        <LockerRoom
          player={overseerPlayer}
          onPurchase={handleMysteryBoxPurchase}
          onClose={() => {
            setShowLockerRoom(false);
            setActiveTab('board');
          }}
          onOperationExecuted={handleOperationExecuted}
        />
      )}

      {/* Profile/Dossier Overlay */}
      {showProfile && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md overflow-y-auto p-4 md:p-8">
          <TheDossier 
            player={playerSnapshot} 
            onClose={() => {
              setShowProfile(false);
              setActiveTab('board');
            }} 
          />
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
