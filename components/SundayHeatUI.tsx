import React, { useState, useEffect } from 'react';
import { SquadRide, ParlayLeg } from '../types';

interface SundayHeatUIProps {
  squadRide: SquadRide;
  isSunday: boolean;
  onRoast?: (userId: string, reaction: '🤓' | 'L') => void;
}

/**
 * SundayHeatUI - Live mode interface for Sunday NFL games
 * Displays Driver's Hot Seat, live progress tracking, and tax alert animations
 */
export const SundayHeatUI: React.FC<SundayHeatUIProps> = ({
  squadRide,
  isSunday,
  onRoast
}) => {
  const [showTaxAlert, setShowTaxAlert] = useState(false);
  const [taxAmount, setTaxAmount] = useState(0);
  const [roastCounts, setRoastCounts] = useState<Record<string, { nerd: number; L: number }>>({});

  // Calculate progress percentage for each leg
  const getProgr essForLeg = (leg: ParlayLeg): number => {
    if (leg.status === 'completed' && leg.won) return 100;
    if (leg.status === 'completed' && !leg.won) return 100;
    if (leg.status === 'in_progress') return 50;
    return 0;
  };

  // Get color for progress bar based on status
  const getProgressColor = (leg: ParlayLeg): string => {
    if (leg.status === 'pending') return 'bg-board-navy';
    if (leg.status === 'in_progress') return 'bg-yellow-500';
    if (leg.status === 'completed' && leg.won) return 'bg-board-off-white';
    return 'bg-red-600';
  };

  // Handle roast button clicks
  const handleRoast = (reaction: '🤓' | 'L') => {
    if (onRoast && squadRide.driverId) {
      onRoast(squadRide.driverId, reaction);
      
      // Update local counts
      setRoastCounts(prev => ({
        ...prev,
        [squadRide.driverId]: {
          nerd: (prev[squadRide.driverId]?.nerd || 0) + (reaction === '🤓' ? 1 : 0),
          L: (prev[squadRide.driverId]?.L || 0) + (reaction === 'L' ? 1 : 0)
        }
      }));
    }
  };

  // Show tax alert when ride completes
  useEffect(() => {
    if (squadRide.status === 'completed' && !squadRide.legs.every(leg => leg.won)) {
      // Calculate tax amount (total pot transferred to subject)
      const totalPot = squadRide.passengers.reduce((sum, p) => sum + p.wager, 0);
      setTaxAmount(totalPot);
      setShowTaxAlert(true);
      
      // Hide after 5 seconds
      setTimeout(() => setShowTaxAlert(false), 5000);
    }
  }, [squadRide.status]);

  if (!isSunday) return null;

  const driverCounts = roastCounts[squadRide.driverId] || { nerd: 0, L: 0 };
  const completedLegs = squadRide.legs.filter(leg => leg.status === 'completed' && leg.won).length;
  const isFinalLeg = completedLegs === 2 && squadRide.legs.some(leg => leg.status === 'in_progress');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 pointer-events-none">
      {/* Elite Noir Theme Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-board-navy via-black to-board-navy opacity-80" />
      
      {/* Driver's Hot Seat - Pulsating Card */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className={`bg-board-navy border-4 ${isFinalLeg ? 'border-board-red' : 'border-board-crimson'} rounded-lg p-6 shadow-2xl animate-pulse-border`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-2xl font-bold text-board-off-white">
              🔥 DRIVER'S HOT SEAT
            </div>
            <div className="text-board-red text-xl font-mono">
              {squadRide.driverId}
            </div>
          </div>

          {/* Live Progress Bars */}
          <div className="space-y-3">
            {squadRide.legs.map((leg, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm text-board-off-white">
                  <span>Leg {index + 1}: {leg.game}</span>
                  <span>
                    {leg.status === 'completed' && (leg.won ? '✅' : '❌')}
                    {leg.status === 'in_progress' && '⏳'}
                    {leg.status === 'pending' && '⏸️'}
                  </span>
                </div>
                <div className="h-3 bg-board-navy rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressColor(leg)}`}
                    style={{ width: `${getProgressForLeg(leg)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Nitro Boost Indicator */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-board-off-white font-mono">
              💥 NITRO: {squadRide.nitroBoost.multiplier.toFixed(2)}x
            </span>
            <span className="text-board-off-white font-mono">
              {squadRide.passengers.length} RIDERS
            </span>
          </div>

          {/* Roast Feed */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleRoast('🤓')}
              className="flex-1 bg-board-crimson hover:bg-red-700 text-board-off-white py-2 px-4 rounded-lg transition-colors"
            >
              🤓 ({driverCounts.nerd})
            </button>
            <button
              onClick={() => handleRoast('L')}
              className="flex-1 bg-board-crimson hover:bg-red-700 text-board-off-white py-2 px-4 rounded-lg transition-colors"
            >
              L ({driverCounts.L})
            </button>
          </div>

          {/* Final Leg Alert */}
          {isFinalLeg && (
            <div className="mt-4 bg-board-red text-board-off-white text-center py-2 px-4 rounded-lg animate-pulse font-bold">
              ⚠️ FINAL LEG LIVE ⚠️
            </div>
          )}
        </div>
      </div>

      {/* Tax Alert Animation */}
      {showTaxAlert && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-board-navy border-4 border-board-red rounded-lg p-8 shadow-2xl animate-bounce-in">
            <div className="text-4xl font-bold text-board-red text-center mb-4">
              🏛️ VAULT TRANSFER
            </div>
            <div className="text-6xl font-mono text-board-off-white text-center mb-4">
              +{taxAmount.toLocaleString()} GRIT
            </div>
            <div className="text-center text-board-off-white">
              The ambush backfired. The subject collected the pot.
            </div>
            
            {/* Flying Grit Particles */}
            <div className="relative h-20 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-fly-grit"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                >
                  💰
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% {
            border-color: #ff3333;
            box-shadow: 0 0 20px #ff3333;
          }
          50% {
            border-color: #8b0000;
            box-shadow: 0 0 40px #ff3333;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes fly-grit {
          0% {
            transform: translateY(100px) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }

        .animate-fly-grit {
          animation: fly-grit 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
