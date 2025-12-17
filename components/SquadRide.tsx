import React, { useState, useEffect } from 'react';
import { SquadRide as SquadRideType, Player } from '../types';
import {
  joinSquadRide,
  getNitroBoostLevel,
  calculatePassengerPayout,
  calculateParlayOdds,
  getSquadProgress,
  lockGritForRide
} from '../services/squadRideService';

interface SquadRideProps {
  ride: SquadRideType;
  currentPlayer: Player;
  onJoin: (rideId: string, stake: number) => void;
  onClose: () => void;
}

export const SquadRide: React.FC<SquadRideProps> = ({
  ride,
  currentPlayer,
  onJoin,
  onClose
}) => {
  const [stakeAmount, setStakeAmount] = useState(ride.minStake);
  const [isJoining, setIsJoining] = useState(false);

  const nitroBoostLevel = getNitroBoostLevel(ride.passengers.length);
  const parlayOdds = calculateParlayOdds(ride.parlayLegs);
  const progress = getSquadProgress(ride);
  const isPassenger = ride.passengers.some(p => p.playerId === currentPlayer.id);
  const isDriver = ride.driverId === currentPlayer.id;
  const availableGrit = currentPlayer.grit - (currentPlayer.lockedGrit || 0);

  // Calculate potential payout
  const potentialPayout = calculatePassengerPayout(
    stakeAmount,
    parlayOdds,
    nitroBoostLevel.multiplier
  );

  const handleJoinRide = () => {
    if (stakeAmount < ride.minStake) {
      alert(`Minimum stake is ${ride.minStake} grit`);
      return;
    }

    if (stakeAmount > availableGrit) {
      alert('Insufficient available grit');
      return;
    }

    setIsJoining(true);
    // Placeholder for sound effect: playSound('car-door-slam.mp3');
    onJoin(ride.id, stakeAmount);
  };

  // Heat shimmer intensity based on passenger count
  const shimmerIntensity = Math.min(ride.passengers.length / 20, 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      {/* Squad Ride Card */}
      <div 
        className="relative bg-board-navy rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-board-red"
        style={{
          boxShadow: `0 0 ${20 + shimmerIntensity * 40}px rgba(255, 51, 51, ${0.3 + shimmerIntensity * 0.5})`
        }}
      >
        {/* Heat Shimmer Effect */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255, 51, 51, ${shimmerIntensity * 0.15}) 0%, transparent 70%)`,
            animation: `pulse ${3 - shimmerIntensity * 1.5}s ease-in-out infinite`
          }}
        />

        {/* Header */}
        <div className="relative p-6 border-b border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🚗</span>
            <div>
              <h2 className="text-2xl font-bold text-board-off-white" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
                THE SQUAD RIDE
              </h2>
              <p className="text-sm text-gray-400">Co-op NFL Parlay • Nitro Boost Active</p>
            </div>
          </div>

          {/* Driver Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg">
            <div className="w-12 h-12 bg-board-crimson rounded-full flex items-center justify-center text-2xl">
              🎯
            </div>
            <div>
              <div className="text-xs text-gray-400">DRIVER</div>
              <div className="text-lg font-bold text-board-red">{ride.driverName}</div>
            </div>
            {isDriver && (
              <div 
                className="ml-auto px-3 py-1 bg-board-red bg-opacity-20 border border-board-red rounded animate-pulse"
                style={{ boxShadow: '0 0 15px rgba(255, 51, 51, 0.5)' }}
              >
                <span className="text-board-red font-bold text-sm">⚡ PRESSURE</span>
              </div>
            )}
          </div>
        </div>

        {/* Parlay Legs */}
        <div className="p-6 space-y-3">
          <h3 className="text-lg font-bold text-board-off-white mb-3">3-LEG NFL PARLAY</h3>
          {ride.parlayLegs.map((leg, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                leg.status === 'won' ? 'bg-green-900 bg-opacity-20 border-green-500' :
                leg.status === 'lost' ? 'bg-red-900 bg-opacity-20 border-red-500' :
                'bg-gray-800 bg-opacity-50 border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm text-gray-400">LEG {idx + 1}</div>
                  <div className="font-bold text-white">{leg.teamName}</div>
                  <div className="text-xs text-gray-400">{leg.betType}</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-mono font-bold ${
                    leg.odds > 0 ? 'text-green-400' : 'text-board-red'
                  }`}>
                    {leg.odds > 0 ? '+' : ''}{leg.odds}
                  </div>
                  {leg.status === 'won' && <div className="text-green-500">✅ HIT</div>}
                  {leg.status === 'lost' && <div className="text-red-500">❌ MISS</div>}
                </div>
              </div>
            </div>
          ))}

          {/* Squad Progress Bar */}
          {ride.status === 'in_progress' && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">SQUAD PROGRESS</span>
                <span className="text-white font-bold">{progress.completedLegs} / {progress.totalLegs} LEGS</span>
              </div>
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${progress.percentage}%`,
                    backgroundColor: progress.color
                  }}
                />
              </div>
            </div>
          )}

          {/* Nitro Boost Meter */}
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 51, 51, 0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-gray-400">NITRO BOOST MULTIPLIER</div>
                <div className="text-2xl font-bold text-board-red">
                  {nitroBoostLevel.multiplier.toFixed(2)}x
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl">{nitroBoostLevel.emoji}</div>
                <div className="text-xs font-bold" style={{ color: nitroBoostLevel.color }}>
                  {nitroBoostLevel.tier}
                </div>
              </div>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 animate-pulse"
                style={{
                  width: `${Math.min((ride.passengers.length / 20) * 100, 100)}%`,
                  backgroundColor: nitroBoostLevel.color
                }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-2 text-center">
              {ride.passengers.length} passenger{ride.passengers.length !== 1 ? 's' : ''} aboard
            </div>
          </div>

          {/* Passenger List */}
          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-400 mb-3">PASSENGERS ({ride.passengers.length})</h4>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {ride.passengers.map((passenger, idx) => (
                <div 
                  key={idx}
                  className="relative group"
                  title={`${passenger.playerName} - ${passenger.stake} grit`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                    passenger.isDriver ? 'bg-board-red' : 'bg-gray-700'
                  } border-2 ${passenger.isDriver ? 'border-board-red' : 'border-gray-600'}`}>
                    {passenger.isDriver ? '🎯' : '👤'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-board-navy" />
                </div>
              ))}
            </div>
          </div>

          {/* Total Pot */}
          <div className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-gray-400">TOTAL POT</div>
              <div className="text-3xl font-mono font-bold text-yellow-400">
                {ride.totalPot.toLocaleString()} GRIT
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Combined American Odds: {parlayOdds > 0 ? '+' : ''}{parlayOdds}
              </div>
            </div>
          </div>

          {/* Join Section */}
          {!isPassenger && ride.status === 'open' && (
            <div className="mt-6 p-6 bg-board-red bg-opacity-10 border-2 border-board-red rounded-lg">
              <h4 className="text-lg font-bold text-board-off-white mb-4">JOIN THE RIDE</h4>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  YOUR STAKE (min: {ride.minStake} grit)
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(parseInt(e.target, 10) || 0)}
                  min={ride.minStake}
                  max={availableGrit}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white font-mono text-xl focus:border-board-red focus:outline-none"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Available: {availableGrit.toLocaleString()} grit
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Base Payout:</span>
                  <span className="text-white font-mono">{(stakeAmount * (americanToDecimal(parlayOdds))).toFixed(0)} grit</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Nitro Boost:</span>
                  <span className="text-board-red font-bold">{nitroBoostLevel.multiplier.toFixed(2)}x</span>
                </div>
                <div className="border-t border-gray-700 my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Potential Payout:</span>
                  <span className="text-green-400 font-mono font-bold text-lg">
                    {potentialPayout.toLocaleString()} GRIT
                  </span>
                </div>
              </div>

              <button
                onClick={handleJoinRide}
                disabled={isJoining || stakeAmount < ride.minStake || stakeAmount > availableGrit}
                className="w-full py-4 bg-board-red hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105 active:scale-95"
                style={{ fontFamily: 'Archivo Black, sans-serif' }}
              >
                🚗 GET IN {isJoining && '...'}
              </button>
            </div>
          )}

          {/* Already Joined */}
          {isPassenger && (
            <div className="mt-6 p-6 bg-green-900 bg-opacity-20 border-2 border-green-500 rounded-lg text-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-green-400 font-bold text-lg">YOU'RE ON THE RIDE!</div>
              <div className="text-sm text-gray-400 mt-2">
                Your stake: {ride.passengers.find(p => p.playerId === currentPlayer.id)?.stake} grit
              </div>
            </div>
          )}

          {/* Ride Status */}
          {ride.status !== 'open' && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-400">
                {ride.status === 'locked' && '🔒 RIDE LOCKED - NO MORE PASSENGERS'}
                {ride.status === 'in_progress' && '🏈 GAMES IN PROGRESS'}
                {ride.status === 'completed' && '🎉 SQUAD WIN!'}
                {ride.status === 'failed' && '💀 RIDE FAILED'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function
function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return (americanOdds / 100) + 1;
  } else {
    return (100 / Math.abs(americanOdds)) + 1;
  }
}
