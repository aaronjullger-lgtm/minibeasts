/**
 * War Room Demo - Example usage of the War Room and Prophecy Card components
 * 
 * This file demonstrates how to integrate the "Second Screen" experience
 * into your application during live NFL games.
 */

import React, { useState, useEffect } from 'react';
import { WarRoom } from '../components/WarRoom';
import { ProphecyCard } from '../components/ProphecyCard';
import { liveGameService } from '../services/liveGameService';
import type { LiveGame, ProphecyCard as ProphecyCardType, SquadRidePassenger } from '../types';

export const WarRoomDemo: React.FC = () => {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [activeProphecyCard, setActiveProphecyCard] = useState<ProphecyCardType | null>(null);
  const [currentPlayerGrit, setCurrentPlayerGrit] = useState(1000);

  // Initialize the live game service
  useEffect(() => {
    // Start live game simulation with 3 games
    liveGameService.initialize(3);
    
    // Get initial games
    setGames(liveGameService.getGames());

    // Subscribe to Commish commentary
    const unsubscribeCommish = liveGameService.onCommishCommentary((message) => {
      console.log('Commish says:', message.content);
      // In a real app, you would add this to your chat UI
    });

    // Update games periodically
    const interval = setInterval(() => {
      setGames(liveGameService.getGames());
    }, 1000);

    // Cleanup
    return () => {
      unsubscribeCommish();
      clearInterval(interval);
      liveGameService.dispose();
    };
  }, []);

  // Example: Create a prophecy card when a game starts
  useEffect(() => {
    if (games.length > 0 && !activeProphecyCard) {
      // Create a sample prophecy card
      const sampleCard: ProphecyCardType = {
        id: 'prophecy_1',
        gameId: games[0].id,
        title: 'Next Drive Outcome',
        description: `What happens on ${games[0].homeTeam}'s next possession?`,
        options: [
          {
            id: 'touchdown',
            label: 'Touchdown',
            odds: 250,
            bets: [],
            totalWagered: 0
          },
          {
            id: 'field_goal',
            label: 'Field Goal',
            odds: 150,
            bets: [],
            totalWagered: 0
          },
          {
            id: 'punt',
            label: 'Punt or Turnover',
            odds: -110,
            bets: [],
            totalWagered: 0
          }
        ],
        createdAt: Date.now(),
        expiresAt: Date.now() + 120000, // 2 minutes
        isLocked: false,
        isResolved: false
      };
      
      setActiveProphecyCard(sampleCard);
    }
  }, [games, activeProphecyCard]);

  // Example squad ride passengers
  const samplePassengers: SquadRidePassenger[] = [
    {
      playerId: 'player1',
      playerName: 'Aaron',
      stake: 100,
      joinedAt: Date.now() - 60000,
      isDriver: true
    },
    {
      playerId: 'player2',
      playerName: 'Colin',
      stake: 75,
      joinedAt: Date.now() - 30000,
      isDriver: false
    },
    {
      playerId: 'player3',
      playerName: 'Spencer',
      stake: 150,
      joinedAt: Date.now() - 15000,
      isDriver: false
    }
  ];

  const handlePlaceProphecyBet = (cardId: string, optionId: string, wager: number) => {
    console.log('Placing prophecy bet:', { cardId, optionId, wager });
    
    // In a real app, you would:
    // 1. Validate the bet
    // 2. Deduct grit from player
    // 3. Add bet to the option
    // 4. Update the card state
    
    setCurrentPlayerGrit(prev => prev - wager);
    setActiveProphecyCard(null); // Close card after bet
  };

  return (
    <div className="min-h-screen bg-board-navy">
      {/* War Room Dashboard */}
      {games.length > 0 && (
        <WarRoom 
          games={games}
          squadPassengers={samplePassengers}
        />
      )}

      {/* Prophecy Card Overlay */}
      {activeProphecyCard && (
        <ProphecyCard
          card={activeProphecyCard}
          currentPlayerGrit={currentPlayerGrit}
          onPlaceBet={handlePlaceProphecyBet}
          onClose={() => setActiveProphecyCard(null)}
        />
      )}

      {/* Instructions for developers */}
      <div className="fixed bottom-4 left-4 bg-board-muted-blue p-4 rounded-lg border border-board-red max-w-md">
        <h3 className="text-board-gold font-board-grit text-sm mb-2">
          Developer Notes:
        </h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Games auto-generate events every 15-45 seconds</li>
          <li>• Touchdowns trigger screen shake + gold flash</li>
          <li>• Turnovers trigger glitch effect + red flash</li>
          <li>• Prophecy cards lock after 2 minutes</li>
          <li>• Squad avatars bounce when team is winning</li>
          <li>• Check console for Commish commentary</li>
        </ul>
        <div className="mt-2 text-xs text-board-gold">
          Grit: {currentPlayerGrit}
        </div>
      </div>
    </div>
  );
};

/**
 * Integration Guide:
 * 
 * 1. Activate War Room on Sundays (Game Day):
 *    - Replace main board view with <WarRoom />
 *    - Initialize liveGameService.initialize(numGames)
 * 
 * 2. Show Prophecy Cards during games:
 *    - Create ProphecyCard instances when game momentum shifts
 *    - Set 2-minute timer for betting
 *    - Lock cards when timer expires
 *    - Resolve based on actual game events
 * 
 * 3. Integrate with Squad Rides:
 *    - Pass squad passengers to WarRoom component
 *    - Avatars will animate based on game state
 * 
 * 4. Subscribe to events:
 *    liveGameService.onGameEvent(gameId, (event) => {
 *      // Handle event (update UI, trigger effects, etc.)
 *    });
 * 
 *    liveGameService.onCommishCommentary((message) => {
 *      // Add to chat feed
 *    });
 * 
 * 5. Cleanup:
 *    - Call liveGameService.dispose() when leaving War Room
 *    - Unsubscribe from event listeners
 */
