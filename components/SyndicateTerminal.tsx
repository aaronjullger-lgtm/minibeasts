/**
 * Syndicate Terminal Component
 * The black market menu for illegal actions
 * Brutalist, high-contrast UI with monospace font
 */

import React, { useState } from 'react';
import { OverseerPlayerState } from '../types';
import { corruptionService, CORRUPTION_COSTS, CorruptionAction } from '../services/corruptionService';
import { DeepStateOverlay } from './DeepStateOverlay';

interface SyndicateTerminalProps {
  player: OverseerPlayerState;
  onActionComplete: (action: CorruptionAction, cost: number) => void;
  onClose: () => void;
}

interface SyndicateAction {
  id: CorruptionAction;
  name: string;
  description: string;
  cost: number;
  emoji: string;
}

export const SyndicateTerminal: React.FC<SyndicateTerminalProps> = ({
  player,
  onActionComplete,
  onClose,
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedAction, setSelectedAction] = useState<CorruptionAction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const actions: SyndicateAction[] = [
    {
      id: 'WIRETAP',
      name: 'WIRETAP',
      description: 'Reveal hidden text and odds on a target bet. Gain intel advantage.',
      cost: CORRUPTION_COSTS.WIRETAP,
      emoji: '📡',
    },
    {
      id: 'GAG_ORDER',
      name: 'GAG ORDER',
      description: 'Silence a rival for 24 hours. Block their chat privileges.',
      cost: CORRUPTION_COSTS.GAG_ORDER,
      emoji: '🔇',
    },
    {
      id: 'FRAME_UP',
      name: 'FRAME UP',
      description: 'Send fake notification to rival. Psychological warfare.',
      cost: CORRUPTION_COSTS.FRAME_UP,
      emoji: '📨',
    },
  ];

  const handleActionClick = (action: SyndicateAction) => {
    setErrorMessage(null);
    
    // Check if player has enough grit
    if (player.grit < action.cost) {
      setErrorMessage('INSUFFICIENT FUNDS. THE SYNDICATE DOES NOT WORK ON CREDIT.');
      // Haptic feedback (mock)
      console.log('HAPTIC: Error Buzz');
      return;
    }

    try {
      // Execute the action based on type
      switch (action.id) {
        case 'WIRETAP':
          // For demo, use a mock bet ID
          corruptionService.purchaseWiretap(player.id, 'demo_bet_001', player.grit);
          break;
        case 'GAG_ORDER':
          // For demo, use a mock rival ID
          corruptionService.applyGagOrder('demo_rival_001', player.grit);
          break;
        case 'FRAME_UP':
          // For demo, send a mock frame-up
          corruptionService.frameUp('demo_rival_001', 'You have been targeted by The Syndicate.', player.grit);
          break;
      }

      // Trigger overlay to confirm the hack
      setSelectedAction(action.id);
      setShowOverlay(true);

      // Haptic feedback (mock)
      console.log('HAPTIC: Heavy Pulse');

      // Auto-close overlay and complete action
      setTimeout(() => {
        setShowOverlay(false);
        onActionComplete(action.id, action.cost);
      }, 2000);

    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('TRANSACTION FAILED. TRY AGAIN.');
      }
      console.log('HAPTIC: Error Buzz');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/95 overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="text-6xl mb-4 animate-pulse">🔓</div>
              <h1 className="text-4xl font-board-grit font-bold text-board-red mb-2 uppercase tracking-wider">
                ENCRYPTED CONNECTION ESTABLISHED
              </h1>
              <p className="text-board-off-white/70 font-board-grit text-sm">
                /// THE SYNDICATE - BLACK MARKET OPERATIONS ///
              </p>
              <div className="mt-4 text-board-gold font-board-grit text-xl">
                AVAILABLE FUNDS: {player.grit.toLocaleString()} GRIT
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 bg-board-red/20 border-2 border-board-red text-board-red p-4 rounded font-board-grit text-center animate-pulse">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Action List */}
            <div className="space-y-4 mb-8">
              {actions.map((action, index) => (
                <div
                  key={action.id}
                  className="bg-board-navy border-2 border-board-red rounded-none p-6 hover:bg-board-red/10 transition-all transform hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleActionClick(action)}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl flex-shrink-0">{action.emoji}</div>
                    
                    <div className="flex-grow">
                      <h3 className="text-2xl font-board-grit font-bold text-board-red mb-2 uppercase">
                        {action.name}
                      </h3>
                      <p className="text-board-off-white font-board-grit text-sm mb-3">
                        {action.description}
                      </p>
                      <div className="text-board-gold font-board-grit text-lg font-bold">
                        COST: {action.cost.toLocaleString()} GRIT
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        className={`px-6 py-3 rounded-none font-board-grit font-bold text-lg uppercase tracking-wider transition-all transform ${
                          player.grit >= action.cost
                            ? 'bg-board-red text-board-navy hover:bg-board-red/90 active:scale-95'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                        disabled={player.grit < action.cost}
                      >
                        EXECUTE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className="text-center">
              <button
                onClick={onClose}
                className="px-8 py-4 bg-board-muted-blue text-board-off-white rounded-none font-board-grit font-bold text-lg uppercase tracking-wider hover:bg-board-muted-blue/80 transition-all transform active:scale-95"
              >
                ← DISCONNECT
              </button>
            </div>

            {/* Warning Footer */}
            <div className="mt-8 text-center text-board-muted-blue font-board-grit text-xs">
              <p>/// ALL TRANSACTIONS ARE FINAL ///</p>
              <p>/// USE AT YOUR OWN RISK ///</p>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}</style>
      </div>

      {/* Deep State Overlay */}
      <DeepStateOverlay
        isVisible={showOverlay}
        autoCloseDuration={2000}
      />
    </>
  );
};
