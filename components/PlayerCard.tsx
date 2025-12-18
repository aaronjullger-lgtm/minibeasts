import React, { useState } from 'react';
import { PlayerCardData, RoastReaction } from '../types';
import { IdentityCard, RiskProfileBadge, PrestigeBadge } from './IdentityCard';

interface PlayerCardProps {
  playerData: PlayerCardData;
  onClose: () => void;
  onSendRoast?: (reactionType: '🤓' | 'L') => void;
  onSendTrade?: () => void;
  onReportActivity?: () => void;
  onEquipItem?: (itemId: string, slotId: string) => void;
  onUnequipItem?: (slotId: string) => void;
  canInteract?: boolean; // False if viewing own card
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  playerData,
  onClose,
  onSendRoast,
  onSendTrade,
  onReportActivity,
  onEquipItem,
  onUnequipItem,
  canInteract = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [expandedRapSheet, setExpandedRapSheet] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const getStreakIcon = () => {
    if (playerData.streak.count < 3) return null;
    
    if (playerData.streak.type === 'win') {
      return <span className="text-board-red text-2xl">🔥</span>;
    } else {
      return <span className="text-blue-400 text-2xl">❄️</span>;
    }
  };

  const getStreakText = () => {
    if (playerData.streak.count === 0) return null;
    
    const typeText = playerData.streak.type === 'win' ? 'W' : 'L';
    return `${playerData.streak.count}${typeText}`;
  };

  const getTotalPassiveMultiplier = () => {
    const payoutBuffs = playerData.passiveBuffs.filter(
      b => b.buffType === 'payout_multiplier' || b.buffType === 'grit_earnings_boost'
    );
    
    const total = payoutBuffs.reduce((sum, buff) => sum + buff.value, 0);
    return total > 0 ? `+${Math.round(total * 100)}%` : null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-2xl w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-board-red text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-80 transition-all z-10"
        >
          ✕
        </button>

        {/* Card container with 3D flip */}
        <div 
          className="relative w-full h-[600px] cursor-pointer perspective-1000"
          onClick={handleFlip}
          style={{ perspective: '1000px' }}
        >
          <div
            className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front side */}
            <div
              className={`absolute w-full h-full backface-hidden ${
                playerData.hasGrail ? 'grail-border-shimmer' : ''
              }`}
              style={{
                backfaceVisibility: 'hidden',
              }}
            >
              <div className="bg-board-navy border-2 border-board-off-white rounded-lg p-6 h-full overflow-y-auto">
                {/* Mugshot Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-40 h-40 border-4 border-board-off-white rounded-lg overflow-hidden mugshot-filter">
                      <img
                        src={playerData.avatarUrl || '/default-avatar.png'}
                        alt={playerData.playerName}
                        className="w-full h-full object-cover"
                        style={{
                          filter: 'grayscale(80%) contrast(120%)',
                        }}
                      />
                    </div>
                    
                    {/* Status indicator */}
                    {getStreakIcon() && (
                      <div className="absolute -top-2 -right-2 bg-board-navy border-2 border-board-off-white rounded-full p-2 flex items-center gap-1">
                        {getStreakIcon()}
                        <span className={`text-sm font-bold ${
                          playerData.streak.type === 'win' ? 'text-board-red' : 'text-blue-400'
                        }`}>
                          {getStreakText()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Player name with IdentityCard */}
                <div className="text-center mb-4">
                  <IdentityCard 
                    userName={playerData.playerName}
                    userProfile={playerData.userProfile}
                    size="large"
                    showBadge={true}
                    className="justify-center"
                  />
                  
                  {/* Risk Profile and Prestige details */}
                  {playerData.userProfile && (
                    <div className="mt-4 flex flex-col gap-2 items-center">
                      {playerData.userProfile.riskProfile && (
                        <RiskProfileBadge 
                          riskProfile={playerData.userProfile.riskProfile}
                          size="medium"
                        />
                      )}
                      {playerData.userProfile.prestigeLevels.length > 0 && (
                        <PrestigeBadge
                          season={playerData.userProfile.prestigeLevels[playerData.userProfile.prestigeLevels.length - 1].season}
                          multiplier={playerData.userProfile.prestigeLevels[playerData.userProfile.prestigeLevels.length - 1].multiplier}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Grit display */}
                <div className="bg-black bg-opacity-40 border-2 border-board-off-white rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">CURRENT BALANCE</p>
                    <p className="text-5xl font-bold text-board-off-white font-mono">
                      {playerData.currentGrit.toLocaleString()}
                    </p>
                    <p className="text-board-off-white text-lg">GRIT</p>
                    
                    {getTotalPassiveMultiplier() && (
                      <div className="mt-2 inline-block bg-green-500 bg-opacity-20 border border-green-500 rounded px-3 py-1">
                        <span className="text-green-400 font-bold">{getTotalPassiveMultiplier()} Payout</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-black bg-opacity-40 border border-board-off-white rounded p-3 text-center">
                    <p className="text-gray-400 text-xs mb-1">ITEMS</p>
                    <p className="text-2xl font-bold text-board-off-white">{playerData.totalItems}</p>
                  </div>
                  <div className="bg-black bg-opacity-40 border border-board-off-white rounded p-3 text-center">
                    <p className="text-gray-400 text-xs mb-1">WIN RATE</p>
                    <p className="text-2xl font-bold text-board-off-white">{playerData.winRate}%</p>
                  </div>
                  <div className="bg-black bg-opacity-40 border border-board-off-white rounded p-3 text-center">
                    <p className="text-gray-400 text-xs mb-1">GULAG DAYS</p>
                    <p className="text-2xl font-bold text-board-crimson">{playerData.totalGulagDays}</p>
                  </div>
                </div>

                {/* Equipment slots */}
                <div className="mb-6">
                  <h3 className="text-board-off-white font-bold mb-3 flex items-center gap-2">
                    <span>⚡</span> THE STASH
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {playerData.equipmentSlots.map((slot) => (
                      <div key={slot.slotId} className="bg-black bg-opacity-40 border border-board-off-white rounded p-3">
                        <p className="text-xs text-gray-400 mb-2 uppercase">{slot.slotName}</p>
                        
                        {slot.equippedItem ? (
                          <div className="relative">
                            <div className={`p-2 rounded border ${
                              slot.equippedItem.rarity === 'grail' ? 'border-red-500' :
                              slot.equippedItem.rarity === 'heat' ? 'border-yellow-500' :
                              slot.equippedItem.rarity === 'mid' ? 'border-blue-500' :
                              'border-gray-500'
                            }`}>
                              <p className="text-board-off-white text-xs font-bold truncate">
                                {slot.equippedItem.name}
                              </p>
                            </div>
                            
                            {!canInteract && onUnequipItem && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUnequipItem(slot.slotId);
                                }}
                                className="absolute -top-1 -right-1 bg-board-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-opacity-80"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 border border-dashed border-gray-600 rounded text-center">
                            <p className="text-gray-600 text-xs">Empty</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Passive buffs list */}
                  {playerData.passiveBuffs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {playerData.passiveBuffs.map((buff, idx) => (
                        <div key={idx} className="bg-black bg-opacity-40 border border-green-500 rounded p-2">
                          <p className="text-green-400 text-xs font-bold">{buff.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                {canInteract && (
                  <div className="grid grid-cols-2 gap-3">
                    {onSendRoast && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendRoast('🤓');
                          }}
                          className="bg-board-off-white text-board-navy py-2 px-4 rounded font-bold hover:bg-opacity-90 transition-all"
                        >
                          🤓 Roast
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendRoast('L');
                          }}
                          className="bg-board-crimson text-board-off-white py-2 px-4 rounded font-bold hover:bg-opacity-90 transition-all"
                        >
                          L Take the L
                        </button>
                      </>
                    )}
                    {onSendTrade && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendTrade();
                        }}
                        className="bg-blue-600 text-white py-2 px-4 rounded font-bold hover:bg-opacity-90 transition-all col-span-2"
                      >
                        📦 Propose Trade
                      </button>
                    )}
                  </div>
                )}

                <p className="text-center text-gray-500 text-sm mt-4">
                  👆 Tap to flip and view Rap Sheet
                </p>
              </div>
            </div>

            {/* Back side - Rap Sheet */}
            <div
              className="absolute w-full h-full backface-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="bg-board-navy border-2 border-board-crimson rounded-lg p-6 h-full overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-board-crimson text-center mb-2" style={{ fontFamily: 'Courier New, monospace' }}>
                    RAP SHEET
                  </h2>
                  <p className="text-center text-gray-400 text-sm">HISTORY OF SHAME</p>
                  <p className="text-center text-board-off-white font-mono mt-2">
                    PRISONER #{playerData.playerId.substring(0, 8).toUpperCase()}
                  </p>
                </div>

                {/* Summary stats */}
                <div className="bg-black bg-opacity-60 border-2 border-board-crimson rounded p-4 mb-6 font-mono">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">BANKRUPTCIES</p>
                      <p className="text-3xl font-bold text-board-crimson">{playerData.bankruptcyCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">GULAG TIME</p>
                      <p className="text-3xl font-bold text-board-crimson">{playerData.totalGulagDays}d</p>
                    </div>
                  </div>
                </div>

                {/* Recent L's */}
                <div className="mb-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedRapSheet(!expandedRapSheet);
                    }}
                    className="w-full bg-board-crimson text-board-off-white py-2 px-4 rounded font-bold hover:bg-opacity-90 transition-all flex items-center justify-between"
                  >
                    <span>📜 RECENT L'S & SENTENCES</span>
                    <span>{expandedRapSheet ? '▼' : '▶'}</span>
                  </button>

                  {expandedRapSheet && (
                    <div className="mt-3 space-y-2 font-mono text-sm">
                      {playerData.rapSheet.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No record found</p>
                      ) : (
                        playerData.rapSheet.map((entry, idx) => (
                          <div key={idx} className="bg-black bg-opacity-60 border border-board-crimson rounded p-3">
                            <div className="flex items-start justify-between mb-1">
                              <span className={`text-xs ${
                                entry.type === 'loss' ? 'text-red-400' : 'text-orange-400'
                              }`}>
                                {entry.type === 'loss' ? '❌ LOSS' : '🔒 GULAG'}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-board-off-white text-xs">{entry.description}</p>
                            {entry.linkedVerdictId && (
                              <p className="text-blue-400 text-xs mt-1 hover:underline cursor-pointer">
                                → View Verdict
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <p className="text-center text-gray-500 text-sm mt-4">
                  👆 Tap to flip back to profile
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grail shimmer effect */}
        {playerData.hasGrail && (
          <style jsx>{`
            .grail-border-shimmer {
              position: relative;
              overflow: visible;
            }
            
            .grail-border-shimmer::before {
              content: '';
              position: absolute;
              top: -4px;
              left: -4px;
              right: -4px;
              bottom: -4px;
              background: linear-gradient(90deg, transparent, #ffd700, transparent);
              border-radius: 12px;
              animation: shimmer 3s infinite;
              z-index: -1;
            }
            
            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
            
            @keyframes rotate-y-180 {
              from {
                transform: rotateY(0deg);
              }
              to {
                transform: rotateY(180deg);
              }
            }
            
            .backface-hidden {
              -webkit-backface-visibility: hidden;
              backface-visibility: hidden;
            }
            
            .perspective-1000 {
              perspective: 1000px;
            }
            
            .transform-style-3d {
              transform-style: preserve-3d;
            }
          `}</style>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
