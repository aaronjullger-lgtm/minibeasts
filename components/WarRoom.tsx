import React, { useState, useEffect } from 'react';
import { LiveGame, SquadRidePassenger } from '../types';
import { liveGameService } from '../services/liveGameService';

interface WarRoomProps {
  games: LiveGame[];
  squadPassengers?: SquadRidePassenger[];
  onClose?: () => void;
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th)
 */
function getOrdinalSuffix(num: number): string {
  const suffixes = ['TH', 'ST', 'ND', 'RD'];
  const v = num % 100;
  return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
}

export const WarRoom: React.FC<WarRoomProps> = ({
  games,
  squadPassengers = [],
  onClose
}) => {
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(
    games.length > 0 ? games[0] : null
  );
  const [pulseAnimation, setPulseAnimation] = useState(0);

  useEffect(() => {
    // Subscribe to game events
    if (!selectedGame) return;

    const unsubscribe = liveGameService.onGameEvent(selectedGame.id, (event) => {
      // Update local game state would happen here in a real app
      console.log('Game event received:', event);
      
      // Trigger pulse animation
      setPulseAnimation(prev => prev + 1);
    });

    return () => unsubscribe();
  }, [selectedGame?.id]);

  useEffect(() => {
    // Animate pulse graph
    const interval = setInterval(() => {
      setPulseAnimation(prev => prev + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!selectedGame) {
    return (
      <div className="min-h-screen bg-board-navy flex items-center justify-center">
        <p className="text-board-off-white font-board-grit text-xl">NO LIVE GAMES</p>
      </div>
    );
  }

  const isPulsing = selectedGame.status === 'live';
  const momentumPercent = ((selectedGame.momentum + 100) / 200) * 100; // Convert -100 to 100 range to 0-100%

  return (
    <div className="min-h-screen bg-board-navy relative overflow-hidden">
      {/* Background - Darkened Stadium */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(5, 10, 20, 0.8), rgba(5, 10, 20, 0.95)), url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100" height="100" fill="%23050A14"/%3E%3C/svg%3E")',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-board-grit text-board-off-white mb-4 tracking-wider">
            THE WAR ROOM
          </h1>
          <div className="flex items-center justify-center gap-3">
            {isPulsing && (
              <div 
                className="w-3 h-3 bg-board-red rounded-full animate-pulse"
                style={{
                  boxShadow: '0 0 10px rgba(255, 51, 51, 0.8)'
                }}
              />
            )}
            <p className={`text-xl font-board-grit uppercase tracking-widest ${
              isPulsing ? 'text-board-red' : 'text-gray-400'
            }`}>
              {selectedGame.status === 'live' ? 'LIVE' : selectedGame.status.toUpperCase()} // {selectedGame.quarter}
              {getOrdinalSuffix(selectedGame.quarter)} QTR // {selectedGame.timeRemaining}
            </p>
          </div>
        </div>

        {/* Live Scoreboard */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-board-muted-blue border-2 border-board-red rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6">
              {/* Away Team */}
              <div className="text-center">
                <div className="text-sm text-gray-400 font-board-grit mb-2">AWAY</div>
                <div className="text-3xl font-bold text-board-off-white mb-1">
                  {selectedGame.awayTeam.toUpperCase()}
                </div>
                <div className="text-5xl font-board-grit text-board-gold">
                  {selectedGame.awayScore}
                </div>
              </div>

              {/* VS Indicator */}
              <div className="flex items-center justify-center">
                <div className="text-6xl font-board-grit text-board-red">VS</div>
              </div>

              {/* Home Team */}
              <div className="text-center">
                <div className="text-sm text-gray-400 font-board-grit mb-2">HOME</div>
                <div className="text-3xl font-bold text-board-off-white mb-1">
                  {selectedGame.homeTeam.toUpperCase()}
                </div>
                <div className="text-5xl font-board-grit text-board-gold">
                  {selectedGame.homeScore}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Momentum Meter - The Pulse Graph */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-board-muted-blue border border-board-red rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-board-grit text-board-off-white uppercase">
                Momentum Meter
              </h3>
              <span className="text-sm font-board-grit text-gray-400">
                {selectedGame.momentum > 0 ? `+${selectedGame.momentum.toFixed(0)}` : selectedGame.momentum.toFixed(0)}
              </span>
            </div>

            {/* SVG Wave Visualization */}
            <svg 
              viewBox="0 0 800 200" 
              className="w-full h-32"
              style={{ filter: 'drop-shadow(0 0 8px rgba(255, 51, 51, 0.5))' }}
            >
              {/* Background Grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="800" height="200" fill="url(#grid)" />
              
              {/* Center Line */}
              <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,4" />
              
              {/* Momentum Wave */}
              <path
                d={generateWavePath(selectedGame.momentum, pulseAnimation)}
                fill="none"
                stroke={selectedGame.momentum > 0 ? '#D4AF37' : '#FF3333'}
                strokeWidth="3"
                opacity="0.8"
              />
              
              {/* Current position indicator */}
              <circle
                cx="700"
                cy={100 - selectedGame.momentum}
                r="6"
                fill={selectedGame.momentum > 0 ? '#D4AF37' : '#FF3333'}
                opacity="1"
              >
                <animate
                  attributeName="r"
                  values="6;8;6"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>

            {/* Labels */}
            <div className="flex justify-between mt-2 text-xs font-board-grit">
              <span className="text-board-red">{selectedGame.awayTeam}</span>
              <span className="text-gray-500">NEUTRAL</span>
              <span className="text-board-gold">{selectedGame.homeTeam}</span>
            </div>
          </div>
        </div>

        {/* Squad Ride Integration */}
        {squadPassengers.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-board-muted-blue border border-board-gold rounded-lg p-6">
              <h3 className="text-xl font-board-grit text-board-gold uppercase mb-4">
                🚗 Squad Ride Active
              </h3>
              
              <div className="flex flex-wrap gap-4 justify-center">
                {squadPassengers.map((passenger, index) => {
                  const isWinning = selectedGame.homeScore > selectedGame.awayScore;
                  
                  return (
                    <div
                      key={passenger.playerId}
                      className="relative"
                      style={{
                        animation: isWinning ? 'bounce 0.5s ease-in-out infinite' : 'none',
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      {/* Avatar */}
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${
                          isWinning 
                            ? 'border-board-gold bg-board-gold bg-opacity-20' 
                            : 'border-board-red bg-board-crimson bg-opacity-20'
                        }`}
                        style={{
                          filter: !isWinning ? 'contrast(1.2) brightness(0.8)' : 'none',
                          backgroundImage: !isWinning ? 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.3\'/%3E%3C/svg%3E")' : 'none'
                        }}
                      >
                        {passenger.playerName.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Name */}
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="text-xs text-gray-400 font-board-grit">
                          {passenger.playerName}
                        </span>
                      </div>

                      {/* Driver Badge */}
                      {passenger.isDriver && (
                        <div className="absolute -top-2 -right-2 bg-board-gold text-board-navy text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          🚗
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent Events Feed */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-board-muted-blue border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-board-grit text-board-off-white uppercase mb-4">
              Live Event Feed
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedGame.events.slice(-10).reverse().map((event, index) => (
                <div 
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-board-navy bg-opacity-50 rounded border-l-4"
                  style={{
                    borderLeftColor: event.type === 'TOUCHDOWN' ? '#D4AF37' : 
                                     event.type.includes('TURN') ? '#FF3333' : '#888',
                    animation: index === 0 ? 'slideInRight 0.3s ease-out' : 'none'
                  }}
                >
                  <div className="flex-1">
                    <p className="text-board-off-white text-sm">{event.description}</p>
                    <p className="text-gray-500 text-xs font-board-grit mt-1">
                      Q{event.quarter} • {event.timeRemaining}
                    </p>
                  </div>
                  <div className="text-2xl ml-4">
                    {event.type === 'TOUCHDOWN' ? '🏈' : 
                     event.type === 'FIELD_GOAL' ? '⚡' : 
                     '⚠️'}
                  </div>
                </div>
              ))}
              
              {selectedGame.events.length === 0 && (
                <p className="text-gray-500 text-center py-8 font-board-grit">
                  Waiting for game events...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Game Selector */}
        {games.length > 1 && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="flex gap-2 justify-center flex-wrap">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  className={`px-4 py-2 rounded font-board-grit text-sm transition-all ${
                    selectedGame?.id === game.id
                      ? 'bg-board-red text-white border-2 border-board-red'
                      : 'bg-board-muted-blue text-gray-400 border-2 border-gray-700 hover:border-board-red'
                  }`}
                >
                  {game.awayTeam} @ {game.homeTeam}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Generate SVG path for momentum wave
 */
function generateWavePath(momentum: number, animation: number): string {
  const points: string[] = [];
  const width = 800;
  const centerY = 100;
  const amplitude = Math.abs(momentum) * 0.8; // Scale momentum to pixel amplitude
  
  for (let x = 0; x <= width; x += 10) {
    // Create sine wave with momentum influence
    const frequency = 0.02;
    const phase = animation * 0.5;
    const y = centerY - Math.sin(x * frequency + phase) * (amplitude / 2) - (momentum * 0.5);
    
    if (x === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }
  
  return points.join(' ');
}
