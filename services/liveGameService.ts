/**
 * Live Game Service - Mock Live Data Stream
 * Simulates a websocket connection to NFL stats for real-time game updates.
 * Triggers global effects and Commish commentary based on game events.
 */

import { LiveGame, LiveGameEvent, LiveGameEventType, ChatMessage } from '../types';
import { soundService } from './soundService';

// Mock NFL teams for demo purposes
const NFL_TEAMS = [
  'Chiefs', 'Bills', 'Bengals', 'Ravens', 'Colts', 'Texans',
  'Cowboys', 'Eagles', 'Giants', 'Packers', 'Vikings', '49ers',
  'Rams', 'Seahawks', 'Cardinals', 'Dolphins', 'Jets'
];

// Event simulation intervals
const EVENT_MIN_INTERVAL = 15000; // 15 seconds
const EVENT_MAX_INTERVAL = 45000; // 45 seconds
const MOMENTUM_DECAY_RATE = 0.95; // Momentum decays over time

export class LiveGameService {
  private games: Map<string, LiveGame> = new Map();
  private eventListeners: Map<string, ((event: LiveGameEvent) => void)[]> = new Map();
  private commishListeners: ((message: ChatMessage) => void)[] = [];
  private gameTimers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  /**
   * Initialize the service with mock games
   */
  initialize(numGames = 3): void {
    this.isRunning = true;
    
    // Create mock games
    for (let i = 0; i < numGames; i++) {
      const game = this.createMockGame(i);
      this.games.set(game.id, game);
      this.startGameSimulation(game.id);
    }
  }

  /**
   * Create a mock game
   */
  private createMockGame(index: number): LiveGame {
    const homeTeam = NFL_TEAMS[index * 2] || 'Chiefs';
    const awayTeam = NFL_TEAMS[index * 2 + 1] || 'Bills';
    
    return {
      id: `game_${index}`,
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      quarter: 1,
      timeRemaining: '15:00',
      status: 'live',
      momentum: 0,
      events: [],
      lastEventTime: Date.now()
    };
  }

  /**
   * Start simulating events for a game
   */
  private startGameSimulation(gameId: string): void {
    const simulateEvent = () => {
      if (!this.isRunning) return;
      
      const game = this.games.get(gameId);
      if (!game || game.status === 'final') return;

      // Generate random event
      const event = this.generateRandomEvent(game);
      this.processEvent(gameId, event);

      // Schedule next event
      const nextInterval = Math.random() * (EVENT_MAX_INTERVAL - EVENT_MIN_INTERVAL) + EVENT_MIN_INTERVAL;
      const timer = setTimeout(simulateEvent, nextInterval);
      this.gameTimers.set(gameId, timer);
    };

    simulateEvent();
  }

  /**
   * Generate a random game event
   */
  private generateRandomEvent(game: LiveGame): LiveGameEvent {
    const eventTypes: LiveGameEventType[] = [
      'TOUCHDOWN', 'TOUCHDOWN', 'TOUCHDOWN', // More likely
      'FIELD_GOAL', 'FIELD_GOAL',
      'TURNOVER', 'INTERCEPTION', 'FUMBLE'
    ];
    
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const isHome = Math.random() > 0.5;
    const team = isHome ? game.homeTeam : game.awayTeam;
    
    let description = '';
    let points = 0;
    let momentumShift = 0;
    
    switch (type) {
      case 'TOUCHDOWN':
        description = `${team} TOUCHDOWN!`;
        points = 7; // Assuming PAT
        momentumShift = isHome ? 25 : -25;
        break;
      case 'FIELD_GOAL':
        description = `${team} field goal is GOOD!`;
        points = 3;
        momentumShift = isHome ? 10 : -10;
        break;
      case 'TURNOVER':
      case 'INTERCEPTION':
      case 'FUMBLE':
        description = `${team} TURNOVER!`;
        points = 0;
        momentumShift = isHome ? -20 : 20; // Opposite team gets momentum
        break;
    }
    
    return {
      id: `evt_${Date.now()}_${Math.random()}`,
      type,
      gameId: game.id,
      team,
      quarter: game.quarter,
      timeRemaining: this.getRandomTime(),
      description,
      timestamp: Date.now(),
      momentum: momentumShift
    };
  }

  /**
   * Process a game event
   */
  private processEvent(gameId: string, event: LiveGameEvent): void {
    const game = this.games.get(gameId);
    if (!game) return;

    // Update score
    if (event.type === 'TOUCHDOWN' || event.type === 'FIELD_GOAL') {
      const isHome = event.team === game.homeTeam;
      const points = event.type === 'TOUCHDOWN' ? 7 : 3;
      
      if (isHome) {
        game.homeScore += points;
      } else {
        game.awayScore += points;
      }
    }

    // Update momentum
    game.momentum = Math.max(-100, Math.min(100, game.momentum + event.momentum));
    
    // Add event to history
    game.events.push(event);
    game.lastEventTime = event.timestamp;

    // Trigger visual effects based on event type
    this.triggerVisualEffect(event);

    // Generate Commish commentary
    this.generateCommishCommentary(event, game);

    // Notify listeners
    this.notifyEventListeners(gameId, event);

    // Decay momentum over time
    setTimeout(() => {
      if (game) {
        game.momentum *= MOMENTUM_DECAY_RATE;
      }
    }, 5000);
  }

  /**
   * Trigger visual effects for events
   */
  private triggerVisualEffect(event: LiveGameEvent): void {
    switch (event.type) {
      case 'TOUCHDOWN':
        // Trigger screen shake and gold flash
        this.triggerScreenShake();
        this.triggerFlash('#D4AF37'); // board-gold
        soundService.playAchievement();
        break;
      case 'TURNOVER':
      case 'INTERCEPTION':
      case 'FUMBLE':
        // Trigger glitch effect and red flash
        this.triggerGlitchEffect();
        this.triggerFlash('#FF3333'); // board-red
        soundService.playError();
        break;
      case 'FIELD_GOAL':
        soundService.playSuccess();
        break;
    }
  }

  /**
   * Trigger screen shake animation
   */
  private triggerScreenShake(): void {
    const root = document.documentElement;
    root.classList.add('screen-shake');
    setTimeout(() => root.classList.remove('screen-shake'), 500);
  }

  /**
   * Trigger flash effect
   */
  private triggerFlash(color: string): void {
    const flashDiv = document.createElement('div');
    flashDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${color};
      opacity: 0.3;
      pointer-events: none;
      z-index: 9999;
      animation: flash 0.5s ease-out;
    `;
    document.body.appendChild(flashDiv);
    setTimeout(() => document.body.removeChild(flashDiv), 500);
  }

  /**
   * Trigger glitch effect
   */
  private triggerGlitchEffect(): void {
    const root = document.documentElement;
    root.classList.add('glitch-effect');
    setTimeout(() => root.classList.remove('glitch-effect'), 300);
  }

  /**
   * Generate Commish commentary for events
   */
  private generateCommishCommentary(event: LiveGameEvent, game: LiveGame): void {
    let commentary = '';
    
    switch (event.type) {
      case 'TOUCHDOWN':
        const scoreDiff = Math.abs(game.homeScore - game.awayScore);
        if (scoreDiff > 14) {
          commentary = `${event.team} SCORE. PAYING OUT LOYALISTS. THE WISE PROSPER.`;
        } else {
          commentary = `${event.team} TOUCHDOWN DETECTED. MARKETS ADJUSTING...`;
        }
        break;
      case 'TURNOVER':
      case 'INTERCEPTION':
      case 'FUMBLE':
        commentary = `TURNOVER DETECTED. CALCULATING VICTIMS... ${event.team} BACKERS ON NOTICE.`;
        break;
      case 'FIELD_GOAL':
        commentary = `${event.team} SPLITS THE UPRIGHTS. MODEST RETURNS CONFIRMED.`;
        break;
    }
    
    if (commentary) {
      const message: ChatMessage = {
        id: `commish_${Date.now()}`,
        senderId: 'commish',
        senderName: 'THE COMMISH',
        content: commentary,
        timestamp: Date.now(),
        flagged: false
      };
      
      this.notifyCommishListeners(message);
    }
  }

  /**
   * Get random game time
   */
  private getRandomTime(): string {
    const minutes = Math.floor(Math.random() * 15);
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Subscribe to game events
   */
  onGameEvent(gameId: string, callback: (event: LiveGameEvent) => void): () => void {
    if (!this.eventListeners.has(gameId)) {
      this.eventListeners.set(gameId, []);
    }
    
    this.eventListeners.get(gameId)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(gameId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to Commish commentary
   */
  onCommishCommentary(callback: (message: ChatMessage) => void): () => void {
    this.commishListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.commishListeners.indexOf(callback);
      if (index > -1) {
        this.commishListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify event listeners
   */
  private notifyEventListeners(gameId: string, event: LiveGameEvent): void {
    const listeners = this.eventListeners.get(gameId);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  /**
   * Notify Commish listeners
   */
  private notifyCommishListeners(message: ChatMessage): void {
    this.commishListeners.forEach(callback => callback(message));
  }

  /**
   * Get all active games
   */
  getGames(): LiveGame[] {
    return Array.from(this.games.values());
  }

  /**
   * Get specific game
   */
  getGame(gameId: string): LiveGame | undefined {
    return this.games.get(gameId);
  }

  /**
   * Stop all game simulations
   */
  stop(): void {
    this.isRunning = false;
    this.gameTimers.forEach(timer => clearTimeout(timer));
    this.gameTimers.clear();
  }

  /**
   * Clean up
   */
  dispose(): void {
    this.stop();
    this.games.clear();
    this.eventListeners.clear();
    this.commishListeners = [];
  }
}

// Singleton instance
export const liveGameService = new LiveGameService();
