import React from 'react';
import { PlayerState, GlobalState } from '../types';
import { characterDefinitions } from '../constants';

interface DynastyHUDProps {
  player: PlayerState;
  globalState: GlobalState;
  week: number;
  day: number;
}

export const DynastyHUD: React.FC<DynastyHUDProps> = ({ player, globalState, week, day }) => {
  // Get the unique stat name for the current player
  const charDef = characterDefinitions.find(c => c.characterId === player.id);
  const uniqueStatName = charDef?.uniqueStatName || 'Unique Stat';

  // Calculate color classes based on meter values
  const getCringeColor = (value: number) => {
    if (value >= 75) return 'bg-red-600';
    if (value >= 50) return 'bg-orange-500';
    if (value >= 25) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getEntertainmentColor = (value: number) => {
    if (value >= 75) return 'bg-green-600';
    if (value >= 50) return 'bg-lime-500';
    if (value >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Render energy as battery icons
  const renderEnergyBatteries = () => {
    const batteries = [];
    const energyLevel = Math.ceil(player.energy / 33.33); // Convert 0-100 to 0-3
    for (let i = 0; i < 3; i++) {
      batteries.push(
        <span
          key={i}
          className={`text-2xl ${i < energyLevel ? 'opacity-100' : 'opacity-30'}`}
          title={`Energy: ${player.energy}/100`}
        >
          🔋
        </span>
      );
    }
    return batteries;
  };

  return (
    <div className="w-full bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-sm shadow-2xl border-b-4 border-purple-900/50">
      {/* Top Bar - Cringe and Entertainment Meters */}
      <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cringe Meter */}
          <div className="bg-gradient-to-br from-gray-900/90 to-red-900/20 p-4 rounded-2xl border-2 border-red-500/30 shadow-lg hover:shadow-red-500/20 transition-all">
            <div className="flex justify-between items-center mb-2">
              <span className="font-graduate text-lg text-red-400 flex items-center gap-2">
                😬 CRINGE METER
              </span>
              <span className={`text-2xl font-bold ${globalState.cringeMeter >= 75 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {globalState.cringeMeter}%
              </span>
            </div>
            <div className="w-full bg-gray-800/80 rounded-full h-5 overflow-hidden border border-gray-700 shadow-inner">
              <div
                className={`h-full transition-all duration-500 ${getCringeColor(globalState.cringeMeter)} shimmer`}
                style={{ width: `${globalState.cringeMeter}%` }}
              />
            </div>
            <p className="text-xs text-gray-300 mt-2 font-medium">
              {globalState.cringeMeter >= 75 ? '🚨 Critical levels! Chat is dying!' : 
               globalState.cringeMeter >= 50 ? '⚠️ Getting uncomfortable...' : 
               'Keep it cool, don\'t be cringe'}
            </p>
          </div>

          {/* Entertainment Meter */}
          <div className="bg-gradient-to-br from-gray-900/90 to-green-900/20 p-4 rounded-2xl border-2 border-green-500/30 shadow-lg hover:shadow-green-500/20 transition-all">
            <div className="flex justify-between items-center mb-2">
              <span className="font-graduate text-lg text-green-400 flex items-center gap-2">
                🎭 ENTERTAINMENT
              </span>
              <span className={`text-2xl font-bold ${globalState.entertainmentMeter >= 75 ? 'text-green-400' : globalState.entertainmentMeter < 25 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {globalState.entertainmentMeter}%
              </span>
            </div>
            <div className="w-full bg-gray-800/80 rounded-full h-5 overflow-hidden border border-gray-700 shadow-inner">
              <div
                className={`h-full transition-all duration-500 ${getEntertainmentColor(globalState.entertainmentMeter)} shimmer`}
                style={{ width: `${globalState.entertainmentMeter}%` }}
              />
            </div>
            <p className="text-xs text-gray-300 mt-2 font-medium">
              {globalState.entertainmentMeter >= 75 ? '🔥 Chat is popping off!' : 
               globalState.entertainmentMeter < 25 ? '💀 Dead chat, revive it!' : 
               'Keep everyone engaged'}
            </p>
          </div>
        </div>
      </div>

      {/* Side Bar - Player Stats */}
      <div className="p-4 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
          {/* Player Avatar and Name */}
          <div className="flex items-center gap-3 md:border-r-2 md:border-purple-700/50 md:pr-6">
            <div
              className="w-20 h-20 rounded-2xl border-4 border-purple-500/50 shadow-lg shadow-purple-500/30 flex items-center justify-center text-4xl font-bold hover:scale-105 transition-transform"
              style={{ 
                backgroundColor: player.nflTeamColor,
                backgroundImage: `linear-gradient(135deg, ${player.nflTeamColor} 0%, rgba(0,0,0,0.3) 100%)`
              }}
            >
              {player.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-graduate text-3xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {player.name}
              </h2>
              <p className="text-sm text-gray-300 font-semibold">Season {globalState.season} • Dynasty Mode</p>
            </div>
          </div>

          {/* Player Stats Grid */}
          <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Grit */}
            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-4 rounded-xl border-2 border-blue-500/40 text-center hover:scale-105 transition-all shadow-lg hover:shadow-blue-500/30">
              <p className="text-xs font-bold text-blue-300 mb-1 flex items-center justify-center gap-1">
                ⚡ GRIT
              </p>
              <p className="font-graduate text-3xl text-white">{player.grit}</p>
            </div>

            {/* Love Life */}
            <div className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 p-4 rounded-xl border-2 border-pink-500/40 text-center hover:scale-105 transition-all shadow-lg hover:shadow-pink-500/30">
              <p className="text-xs font-bold text-pink-300 mb-1 flex items-center justify-center gap-1">
                💕 LOVE LIFE
              </p>
              <p className="font-graduate text-3xl text-white">{player.loveLife}</p>
              <div className="w-full bg-gray-800/80 rounded-full h-2 mt-2 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all"
                  style={{ width: `${player.loveLife}%` }}
                />
              </div>
            </div>

            {/* Fandom */}
            <div className="bg-gradient-to-br from-purple-900/40 to-violet-900/40 p-4 rounded-xl border-2 border-purple-500/40 text-center hover:scale-105 transition-all shadow-lg hover:shadow-purple-500/30">
              <p className="text-xs font-bold text-purple-300 mb-1 flex items-center justify-center gap-1">
                🏈 FANDOM
              </p>
              <p className="font-graduate text-3xl text-white">{player.fandom}</p>
              <div className="w-full bg-gray-800/80 rounded-full h-2 mt-2 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-purple-500 to-violet-500 h-full rounded-full transition-all"
                  style={{ width: `${player.fandom}%` }}
                />
              </div>
            </div>

            {/* Unique Stat (Dynamic based on character) */}
            <div className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 p-4 rounded-xl border-2 border-yellow-500/40 text-center hover:scale-105 transition-all shadow-lg hover:shadow-yellow-500/30">
              <p className="text-xs font-bold text-yellow-300 mb-1 truncate flex items-center justify-center gap-1" title={uniqueStatName}>
                ⭐ {uniqueStatName.toUpperCase()}
              </p>
              <p className="font-graduate text-3xl text-white">{player.uniqueStatValue}</p>
              <div className="w-full bg-gray-800/80 rounded-full h-2 mt-2 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${player.uniqueStatValue}%` }}
                />
              </div>
            </div>
          </div>

          {/* Energy and Week/Day Display */}
          <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 md:border-l-2 md:border-purple-700/50 md:pl-6">
            {/* Energy Batteries */}
            <div className="text-center bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-3 rounded-xl border border-yellow-500/30">
              <p className="text-xs font-bold text-yellow-300 mb-2">⚡ ENERGY</p>
              <div className="flex gap-1.5">{renderEnergyBatteries()}</div>
            </div>

            {/* Week/Day */}
            <div className="text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl border border-purple-500/30">
              <p className="text-xs font-bold text-purple-300 mb-1">📅 PROGRESS</p>
              <p className="font-graduate text-2xl text-white">Week {week}</p>
              <p className="text-sm text-gray-300 font-semibold">Day {day}/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
