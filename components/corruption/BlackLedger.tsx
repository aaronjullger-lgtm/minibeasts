/**
 * The Black Ledger Component
 * A hidden operations menu with a physical hardware feel
 * Slides up from the bottom like opening a secure briefcase
 * Part of the "Tactical Luxury" design system
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OverseerPlayerState } from '../../types';
import { ledgerService, OperationType, OPERATION_COSTS } from '../../services/ledgerService';
import { TacticalToggle } from '../ui/TacticalToggle';
import { Header, Label, Mono } from '../ui/Typography';

interface BlackLedgerProps {
  player: OverseerPlayerState;
  isOpen?: boolean; // Optional - for conditional rendering
  onClose: () => void;
  onOperationExecuted?: (operation: OperationType, cost: number) => void;
  /** Optional target bet ID for Intercept operation */
  targetBetId?: string;
  /** Optional target player ID for operations */
  targetPlayerId?: string;
}

export const BlackLedger: React.FC<BlackLedgerProps> = ({
  player,
  isOpen = true, // Default to true for backward compatibility
  onClose,
  onOperationExecuted,
  targetBetId = 'demo_bet_001',
  targetPlayerId = 'demo_rival_001',
}) => {
  const [activeOperations, setActiveOperations] = useState<Set<OperationType>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);

  const operations = ledgerService.getOperations();

  // Check for already active operations on mount
  useEffect(() => {
    const active = new Set<OperationType>();
    
    if (ledgerService.hasIntercept(player.id, targetBetId)) {
      active.add('INTERCEPT');
    }
    if (ledgerService.isPlayerJammed(targetPlayerId)) {
      active.add('JAM_COMMS');
    }
    
    setActiveOperations(active);
  }, [player.id, targetBetId, targetPlayerId]);

  const handleToggle = async (operationId: OperationType, currentState: boolean) => {
    if (isExecuting) return;

    // If turning OFF, just update the UI (operations don't support deactivation in backend)
    if (currentState) {
      setActiveOperations((prev) => {
        const next = new Set(prev);
        next.delete(operationId);
        return next;
      });
      return;
    }

    // Check if player has enough grit
    const cost = OPERATION_COSTS[operationId];
    if (player.grit < cost) {
      alert('INSUFFICIENT FUNDS FOR OPERATION');
      return;
    }

    setIsExecuting(true);

    try {
      // Execute the operation
      switch (operationId) {
        case 'INTERCEPT':
          ledgerService.executeIntercept(player.id, targetBetId, player.grit);
          break;
        case 'JAM_COMMS':
          ledgerService.executeJamComms(targetPlayerId, player.grit);
          break;
        case 'FIX_MATCH':
          ledgerService.executeFixMatch(targetPlayerId, 'line_adjustment', player.grit);
          break;
      }

      // Update active operations state
      setActiveOperations((prev) => {
        const next = new Set(prev);
        next.add(operationId);
        return next;
      });

      // Notify parent
      if (onOperationExecuted) {
        onOperationExecuted(operationId, cost);
      }

      // Brief delay for UX feedback
      setTimeout(() => {
        setIsExecuting(false);
      }, 300);
    } catch (error) {
      console.error('Operation failed:', error);
      alert(error instanceof Error ? error.message : 'OPERATION FAILED');
      setIsExecuting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 300,
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-t-lg overflow-hidden bg-tactical-dark border-t border-alert-orange"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 1px,
              rgba(255, 255, 255, 0.02) 1px,
              rgba(255, 255, 255, 0.02) 2px
            )`,
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.9)',
          }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-alert-orange">
            <div className="flex justify-between items-center">
              <Header className="tracking-widest">OPERATIONS</Header>
              <button
                onClick={onClose}
                className="text-muted-text hover:text-paper-white transition-colors"
              >
                <Label>CLOSE</Label>
              </button>
            </div>
          </div>

          {/* Operations List */}
          <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
            {operations.map((operation) => {
              const isActive = activeOperations.has(operation.id);
              const canAfford = player.grit >= operation.cost;

              return (
                <div
                  key={operation.id}
                  className="flex items-center justify-between py-4 border-b border-tactical-border last:border-b-0"
                >
                  {/* Left: Operation Details */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="font-sans font-bold text-paper-white">
                        {operation.name}
                      </span>
                      <Mono className={`text-xs ${canAfford ? 'text-muted-text' : 'text-alert-orange'}`}>
                        {operation.cost.toLocaleString()}
                      </Mono>
                    </div>
                    <p className="text-sm text-muted-text">
                      {operation.description}
                    </p>
                  </div>

                  {/* Right: Toggle Switch */}
                  <div className="ml-6">
                    <TacticalToggle
                      checked={isActive}
                      onChange={(checked) => handleToggle(operation.id, isActive)}
                      disabled={isExecuting || (!canAfford && !isActive)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer - Current Funds */}
          <div className="px-6 py-4 border-t border-tactical-border bg-tactical-panel">
            <div className="flex justify-between items-center">
              <Label>AVAILABLE FUNDS</Label>
              <Mono className="text-xl">{player.grit.toLocaleString()}</Mono>
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
