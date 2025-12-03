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
    <div className="w-full bg-gray-900/90 backdrop-blur-sm shadow-xl border-b-4 border-gray-700">
      {/* Top Bar - Cringe and Entertainment Meters */}
      <div className="p-4 bg-gray-800/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cringe Meter */}
          <div className="bg-gray-900/80 p-3 rounded-lg border-2 border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="font-graduate text-lg text-red-400">CRINGE METER</span>
              <span className="text-xl font-bold">{globalState.cringeMeter}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getCringeColor(globalState.cringeMeter)}`}
                style={{ width: `${globalState.cringeMeter}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Don't let this hit 100 or the chat dies from cringe</p>
          </div>

          {/* Entertainment Meter */}
          <div className="bg-gray-900/80 p-3 rounded-lg border-2 border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="font-graduate text-lg text-green-400">ENTERTAINMENT METER</span>
              <span className="text-xl font-bold">{globalState.entertainmentMeter}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getEntertainmentColor(globalState.entertainmentMeter)}`}
                style={{ width: `${globalState.entertainmentMeter}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Keep everyone entertained or they'll leave</p>
          </div>
        </div>
      </div>

      {/* Side Bar - Player Stats */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
          {/* Player Avatar and Name */}
          <div className="flex items-center gap-3 md:border-r-2 md:border-gray-700 md:pr-4">
            <div
              className="w-16 h-16 rounded-full border-4 border-gray-600 flex items-center justify-center text-3xl"
              style={{ backgroundColor: player.nflTeamColor }}
            >
              {player.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-graduate text-2xl">{player.name}</h2>
              <p className="text-sm text-gray-400">Season {globalState.season}</p>
            </div>
          </div>

          {/* Player Stats Grid */}
          <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Grit */}
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600 text-center">
              <p className="text-xs font-bold text-blue-400 mb-1">GRIT</p>
              <p className="font-graduate text-2xl">{player.grit}</p>
            </div>

            {/* Love Life */}
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600 text-center">
              <p className="text-xs font-bold text-pink-400 mb-1">LOVE LIFE</p>
              <p className="font-graduate text-2xl">{player.loveLife}</p>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div
                  className="bg-pink-500 h-full rounded-full transition-all"
                  style={{ width: `${player.loveLife}%` }}
                />
              </div>
            </div>

            {/* Fandom */}
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600 text-center">
              <p className="text-xs font-bold text-purple-400 mb-1">FANDOM</p>
              <p className="font-graduate text-2xl">{player.fandom}</p>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${player.fandom}%` }}
                />
              </div>
            </div>

            {/* Unique Stat (Dynamic based on character) */}
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600 text-center">
              <p className="text-xs font-bold text-yellow-400 mb-1 truncate" title={uniqueStatName}>
                {uniqueStatName.toUpperCase()}
              </p>
              <p className="font-graduate text-2xl">{player.uniqueStatValue}</p>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div
                  className="bg-yellow-500 h-full rounded-full transition-all"
                  style={{ width: `${player.uniqueStatValue}%` }}
                />
              </div>
            </div>
          </div>

          {/* Energy and Week/Day Display */}
          <div className="flex md:flex-col items-center justify-between md:justify-center gap-3 md:border-l-2 md:border-gray-700 md:pl-4">
            {/* Energy Batteries */}
            <div className="text-center">
              <p className="text-xs font-bold text-yellow-400 mb-1">ENERGY</p>
              <div className="flex gap-1">{renderEnergyBatteries()}</div>
            </div>

            {/* Week/Day */}
            <div className="text-center">
              <p className="text-xs font-bold text-gray-400 mb-1">PROGRESS</p>
              <p className="font-graduate text-lg">Week {week}</p>
              <p className="text-sm text-gray-400">Day {day}/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
