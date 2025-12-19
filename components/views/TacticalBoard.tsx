/**
 * TacticalBoard - The Main Dashboard (Tactical Luxury Edition)
 * Clean, tactical interface for viewing active bets and operations
 * No neon, no glow - just matte black, gunmetal, and safety orange accents
 */

import React, { useState } from 'react';
import { OverseerPlayerState, AmbushBet } from '../../types';
import { Header, Label, Mono } from '../ui/Typography';
import { TacticalCard } from '../ui/TacticalCard';

interface TacticalBoardProps {
  player: OverseerPlayerState;
  globalAmbushBets: AmbushBet[];
  onPlaceAmbushBet: (
    targetUserId: string,
    targetUserName: string,
    description: string,
    category: 'social' | 'behavior' | 'prop',
    odds: number,
    wager: number
  ) => void;
  allPlayers: OverseerPlayerState[];
}

export const TacticalBoard: React.FC<TacticalBoardProps> = ({
  player,
  globalAmbushBets,
  onPlaceAmbushBet,
  allPlayers,
}) => {
  const [showBetSlip, setShowBetSlip] = useState(false);

  // Filter bets where the player is the bettor
  const myBets = globalAmbushBets.filter(bet => bet.bettorId === player.id);
  
  // Filter bets where the player is the target
  const targetingMe = globalAmbushBets.filter(bet => bet.targetUserId === player.id);

  return (
    <div className="min-h-full bg-tactical-dark">
      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* System Ticker - AI Commish Commentary */}
        <div className="bg-tactical-panel border border-tactical-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-alert-orange rounded-full animate-pulse" />
            <Label>SYSTEM STATUS</Label>
          </div>
          <p className="text-sm text-muted-text font-mono">
            Market active. {globalAmbushBets.length} open positions. 
            {targetingMe.length > 0 && ` You have ${targetingMe.length} incoming bet${targetingMe.length === 1 ? '' : 's'}.`}
          </p>
        </div>

        {/* Active Bets Section */}
        {myBets.length > 0 && (
          <div className="space-y-3">
            <Header>Your Active Bets</Header>
            {myBets.map((bet) => (
              <TacticalCard key={bet.id}>
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Label className="text-muted-text">TARGET</Label>
                      <p className="text-paper-white font-sans font-medium">{bet.targetUserName}</p>
                    </div>
                    <div className="text-right">
                      <Label className="text-muted-text">ODDS</Label>
                      <Mono className="text-sm">+{bet.odds}</Mono>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-text">PROPOSITION</Label>
                    <p className="text-sm text-paper-white">{bet.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-tactical-border">
                    <div>
                      <Label className="text-muted-text">STAKE</Label>
                      <Mono className="text-sm">{bet.wager.toLocaleString()}</Mono>
                    </div>
                    <div className="text-right">
                      <Label className="text-muted-text">POTENTIAL</Label>
                      <Mono className="text-sm text-alert-orange">{bet.potentialPayout.toLocaleString()}</Mono>
                    </div>
                  </div>
                </div>
              </TacticalCard>
            ))}
          </div>
        )}

        {/* Incoming Bets Section */}
        {targetingMe.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Header>Surveillance Active</Header>
              <div className="w-2 h-2 bg-alert-orange rounded-full animate-pulse" />
            </div>
            <p className="text-xs text-muted-text">
              You are being monitored. {targetingMe.length} active bet{targetingMe.length === 1 ? '' : 's'} on your behavior.
            </p>
            {targetingMe.map((bet) => (
              <TacticalCard key={bet.id}>
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Label className="text-alert-orange">ANONYMOUS BETTOR</Label>
                      <p className="text-xs text-muted-text uppercase tracking-wider">Identity Redacted</p>
                    </div>
                    <div className="text-right">
                      <Label className="text-muted-text">ODDS</Label>
                      <Mono className="text-sm">+{bet.odds}</Mono>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-text">PROPOSITION</Label>
                    <p className="text-sm text-paper-white">{bet.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-tactical-border">
                    <Label className="text-muted-text">CATEGORY</Label>
                    <span className="text-xs uppercase tracking-wider text-muted-text bg-tactical-panel-hover px-2 py-1 rounded">
                      {bet.category}
                    </span>
                  </div>
                </div>
              </TacticalCard>
            ))}
          </div>
        )}

        {/* Empty State */}
        {myBets.length === 0 && targetingMe.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 opacity-30">🎯</div>
            <Header className="mb-2 text-muted-text">No Active Positions</Header>
            <p className="text-sm text-muted-text">
              Place a bet to get started
            </p>
          </div>
        )}

        {/* Floating Action Button - Place Bet */}
        <div className="fixed bottom-24 right-4 z-40">
          <button
            onClick={() => setShowBetSlip(true)}
            className="w-14 h-14 rounded-full bg-alert-orange text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center text-2xl"
            style={{
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Bet Slip Modal (Simplified - can be enhanced later) */}
      {showBetSlip && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setShowBetSlip(false)}
        >
          <div 
            className="w-full max-w-2xl bg-tactical-panel border-t border-tactical-border rounded-t-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <Header>Place Bet</Header>
              <button 
                onClick={() => setShowBetSlip(false)}
                className="text-muted-text hover:text-paper-white"
              >
                <Label>CLOSE</Label>
              </button>
            </div>

            <div className="text-center py-8">
              <p className="text-muted-text">
                Bet placement UI coming soon...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
