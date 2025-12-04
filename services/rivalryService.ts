import { PlayerState } from '../types';

export interface Rivalry {
  id: string;
  characterId: string;
  characterName: string;
  level: number; // 1-5
  reason: string;
  history: RivalryEvent[];
  resolved: boolean;
}

export interface RivalryEvent {
  type: 'roast' | 'minigame_beat' | 'argument_won' | 'trade_blocked' | 'called_out';
  description: string;
  timestamp: number;
  intensityChange: number;
}

export interface Alliance {
  id: string;
  characterId: string;
  characterName: string;
  strength: number; // 1-5
  benefits: string[];
}

const RIVALRY_KEY = 'minibeasts_rivalries';
const ALLIANCE_KEY = 'minibeasts_alliances';

export const rivalryService = {
  /**
   * Get all active rivalries for current player
   */
  getRivalries(): Rivalry[] {
    try {
      const stored = localStorage.getItem(RIVALRY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load rivalries:', error);
      return [];
    }
  },

  /**
   * Get all alliances for current player
   */
  getAlliances(): Alliance[] {
    try {
      const stored = localStorage.getItem(ALLIANCE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load alliances:', error);
      return [];
    }
  },

  /**
   * Create or intensify a rivalry
   */
  addRivalryEvent(
    characterId: string,
    characterName: string,
    event: Omit<RivalryEvent, 'timestamp'>
  ): Rivalry {
    const rivalries = this.getRivalries();
    let rivalry = rivalries.find(r => r.characterId === characterId);

    const fullEvent: RivalryEvent = {
      ...event,
      timestamp: Date.now()
    };

    if (!rivalry) {
      // Create new rivalry
      rivalry = {
        id: `rivalry_${characterId}_${Date.now()}`,
        characterId,
        characterName,
        level: Math.min(5, Math.max(1, fullEvent.intensityChange)),
        reason: event.description,
        history: [fullEvent],
        resolved: false
      };
      rivalries.push(rivalry);
    } else {
      // Update existing rivalry
      rivalry.level = Math.min(5, Math.max(0, rivalry.level + fullEvent.intensityChange));
      rivalry.history.push(fullEvent);
      
      // If level drops to 0, mark as resolved
      if (rivalry.level === 0) {
        rivalry.resolved = true;
      }
    }

    localStorage.setItem(RIVALRY_KEY, JSON.stringify(rivalries));
    return rivalry;
  },

  /**
   * Create or strengthen an alliance
   */
  createAlliance(
    characterId: string,
    characterName: string,
    reason: string
  ): Alliance {
    const alliances = this.getAlliances();
    let alliance = alliances.find(a => a.characterId === characterId);

    if (!alliance) {
      alliance = {
        id: `alliance_${characterId}_${Date.now()}`,
        characterId,
        characterName,
        strength: 1,
        benefits: [reason]
      };
      alliances.push(alliance);
    } else {
      alliance.strength = Math.min(5, alliance.strength + 1);
      if (!alliance.benefits.includes(reason)) {
        alliance.benefits.push(reason);
      }
    }

    localStorage.setItem(ALLIANCE_KEY, JSON.stringify(alliances));
    return alliance;
  },

  /**
   * Get rivalry effects for gameplay
   */
  getRivalryEffects(rivalries: Rivalry[]) {
    const totalIntensity = rivalries
      .filter(r => !r.resolved)
      .reduce((sum, r) => sum + r.level, 0);

    return {
      chaosMultiplier: 1 + (totalIntensity * 0.1), // +10% chaos per rivalry level
      stressIncrease: totalIntensity * 5, // +5 stress per rivalry level
      contentBonus: totalIntensity * 3, // Rivalries make good content
      achievementProgress: rivalries.filter(r => r.level >= 4).length // Track intense rivalries
    };
  },

  /**
   * Get alliance benefits for gameplay
   */
  getAllianceEffects(alliances: Alliance[]) {
    const totalStrength = alliances.reduce((sum, a) => sum + a.strength, 0);

    return {
      happinessBonus: totalStrength * 5, // +5 happiness per alliance strength
      gritBonus: totalStrength * 2, // Small grit bonus
      supportChance: Math.min(0.5, totalStrength * 0.1), // Chance allies help in tough situations
      tradeBonus: totalStrength * 0.05 // Better trade outcomes
    };
  },

  /**
   * Clear all rivalries and alliances (for new game)
   */
  clearAll(): void {
    localStorage.removeItem(RIVALRY_KEY);
    localStorage.removeItem(ALLIANCE_KEY);
  },

  /**
   * Get suggested rivalry targets based on game state
   */
  suggestRivalryTargets(player: PlayerState, allCharacters: PlayerState[]): string[] {
    const suggestions: string[] = [];
    
    // Characters with better stats
    allCharacters.forEach(char => {
      if (char.id !== player.id && char.grit > player.grit + 20) {
        suggestions.push(char.id);
      }
    });

    // Known antagonists
    const antagonists = ['elie', 'justin', 'colin', 'eric'];
    antagonists.forEach(id => {
      if (!suggestions.includes(id)) {
        suggestions.push(id);
      }
    });

    return suggestions.slice(0, 3);
  }
};
