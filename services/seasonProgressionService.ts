import { PlayerState } from '../types';

export interface WeeklyObjective {
  id: string;
  week: number;
  title: string;
  description: string;
  requirement: (player: PlayerState) => boolean;
  reward: {
    grit: number;
    bonusText: string;
  };
  completed: boolean;
  special?: boolean; // Special weekly events
}

export interface SeasonMilestone {
  week: number;
  title: string;
  description: string;
  unlocked: boolean;
  reward: string;
}

export interface PlayerLegacy {
  seasonsCompleted: number;
  totalGritEarned: number;
  bestWeek: { week: number; grit: number };
  rivalriesResolved: number;
  achievementsUnlocked: number;
  minigamesCompleted: number;
  perfectWeeks: number; // Weeks with all objectives completed
  legendaryMoments: string[]; // Special achievements
}

const LEGACY_KEY = 'minibeasts_legacy';
const CURRENT_SEASON_KEY = 'minibeasts_current_season';

export const seasonProgressionService = {
  /**
   * Generate weekly objectives based on week number and player state
   */
  generateWeeklyObjectives(week: number, player: PlayerState): WeeklyObjective[] {
    const baseObjectives: WeeklyObjective[] = [
      {
        id: `week_${week}_survive`,
        week,
        title: 'Survive the Week',
        description: 'End the week with at least 50 happiness',
        requirement: (p: PlayerState) => p.happiness >= 50,
        reward: { grit: 20, bonusText: 'Basic survival bonus' },
        completed: false
      },
      {
        id: `week_${week}_grit`,
        week,
        title: 'Stack That Grit',
        description: 'Earn at least 100 grit this week',
        requirement: (p: PlayerState) => p.grit >= 100,
        reward: { grit: 30, bonusText: 'Grinder mentality bonus' },
        completed: false
      },
      {
        id: `week_${week}_social`,
        week,
        title: 'Be Active',
        description: 'Send at least 10 messages in the chat',
        requirement: () => false, // Will be tracked separately
        reward: { grit: 15, bonusText: 'Social butterfly bonus' },
        completed: false
      }
    ];

    // Add special themed objectives based on week
    if (week === 1) {
      baseObjectives.push({
        id: `week_${week}_special`,
        week,
        title: 'First Impressions',
        description: 'Make a memorable entrance (roast someone successfully)',
        requirement: () => false, // Event-based
        reward: { grit: 50, bonusText: 'Legendary start bonus' },
        completed: false,
        special: true
      });
    } else if (week === 9) {
      baseObjectives.push({
        id: `week_${week}_special`,
        week,
        title: 'Midseason Madness',
        description: 'Win any minigame this week',
        requirement: () => false,
        reward: { grit: 40, bonusText: 'Clutch performer bonus' },
        completed: false,
        special: true
      });
    } else if (week === 17) {
      baseObjectives.push({
        id: `week_${week}_special`,
        week,
        title: 'Championship Week',
        description: 'Finish in top 3 of the final rankings',
        requirement: () => false,
        reward: { grit: 100, bonusText: 'ELITE STATUS ACHIEVED' },
        completed: false,
        special: true
      });
    }

    return baseObjectives;
  },

  /**
   * Get season milestones
   */
  getSeasonMilestones(): SeasonMilestone[] {
    return [
      {
        week: 1,
        title: 'The New Guy',
        description: 'Survive your first week in the group chat',
        unlocked: false,
        reward: 'Unlock rivalry system'
      },
      {
        week: 4,
        title: 'One of the Boys',
        description: 'Make it through the first month',
        unlocked: false,
        reward: 'Unlock alliance system'
      },
      {
        week: 9,
        title: 'Midseason Form',
        description: 'Reach the halfway point',
        unlocked: false,
        reward: 'New minigames unlocked'
      },
      {
        week: 13,
        title: 'Playoff Push',
        description: 'Enter the final stretch',
        unlocked: false,
        reward: 'High-stakes mode activated'
      },
      {
        week: 17,
        title: 'Season Complete',
        description: 'Finish an entire NFL season',
        unlocked: false,
        reward: 'Legacy rewards & New Game+'
      }
    ];
  },

  /**
   * Get or create player legacy
   */
  getPlayerLegacy(): PlayerLegacy {
    try {
      const stored = localStorage.getItem(LEGACY_KEY);
      if (!stored) {
        return {
          seasonsCompleted: 0,
          totalGritEarned: 0,
          bestWeek: { week: 1, grit: 0 },
          rivalriesResolved: 0,
          achievementsUnlocked: 0,
          minigamesCompleted: 0,
          perfectWeeks: 0,
          legendaryMoments: []
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load legacy:', error);
      return {
        seasonsCompleted: 0,
        totalGritEarned: 0,
        bestWeek: { week: 1, grit: 0 },
        rivalriesResolved: 0,
        achievementsUnlocked: 0,
        minigamesCompleted: 0,
        perfectWeeks: 0,
        legendaryMoments: []
      };
    }
  },

  /**
   * Update player legacy
   */
  updateLegacy(updates: Partial<PlayerLegacy>): void {
    const current = this.getPlayerLegacy();
    const updated = { ...current, ...updates };
    localStorage.setItem(LEGACY_KEY, JSON.stringify(updated));
  },

  /**
   * Add a legendary moment
   */
  addLegendaryMoment(moment: string): void {
    const legacy = this.getPlayerLegacy();
    if (!legacy.legendaryMoments.includes(moment)) {
      legacy.legendaryMoments.push(moment);
      this.updateLegacy(legacy);
    }
  },

  /**
   * Complete season and update legacy
   */
  completeSeasonForLegacy(totalGrit: number, perfectWeeks: number): void {
    const legacy = this.getPlayerLegacy();
    this.updateLegacy({
      seasonsCompleted: legacy.seasonsCompleted + 1,
      totalGritEarned: legacy.totalGritEarned + totalGrit,
      perfectWeeks: legacy.perfectWeeks + perfectWeeks
    });
  },

  /**
   * Get legacy bonuses for New Game+
   */
  getLegacyBonuses(): {
    startingGrit: number;
    unlockAllMinigames: boolean;
    specialPerks: string[];
  } {
    const legacy = this.getPlayerLegacy();
    const bonuses = {
      startingGrit: 0,
      unlockAllMinigames: false,
      specialPerks: [] as string[]
    };

    // Bonus grit for completed seasons
    bonuses.startingGrit = legacy.seasonsCompleted * 50;

    // Unlock all minigames after 2 seasons
    bonuses.unlockAllMinigames = legacy.seasonsCompleted >= 2;

    // Special perks based on achievements
    if (legacy.perfectWeeks >= 5) {
      bonuses.specialPerks.push('Perfect Week Master: +10% grit from all sources');
    }
    if (legacy.rivalriesResolved >= 3) {
      bonuses.specialPerks.push('Peacemaker: Start with max relationship stats');
    }
    if (legacy.minigamesCompleted >= 20) {
      bonuses.specialPerks.push('Minigame Legend: Double minigame rewards');
    }

    return bonuses;
  },

  /**
   * Get week description/flavor text
   */
  getWeekFlavor(week: number): { title: string; description: string; emoji: string } {
    const flavors = [
      { title: 'Week 1: Fresh Start', description: 'Everyone is optimistic... for now', emoji: '🌟' },
      { title: 'Week 2: Reality Check', description: 'First injuries, first disappointments', emoji: '😬' },
      { title: 'Week 3: Finding Your Rhythm', description: 'The chat is heating up', emoji: '🔥' },
      { title: 'Week 4: First Month Complete', description: 'You survived this long', emoji: '💪' },
      { title: 'Week 5: Trade Deadline Chaos', description: 'Everyone is panicking', emoji: '📉' },
      { title: 'Week 6: Midseason Grind', description: 'The long haul begins', emoji: '⚙️' },
      { title: 'Week 7: Rivalry Week', description: 'Old grudges resurface', emoji: '⚔️' },
      { title: 'Week 8: Bye Week Blues', description: 'Half your team is on bye', emoji: '😴' },
      { title: 'Week 9: Halfway There', description: 'The season peak', emoji: '⛰️' },
      { title: 'Week 10: Desperation Mode', description: 'Playoffs slipping away', emoji: '😰' },
      { title: 'Week 11: Last Chance', description: 'Make or break time', emoji: '🎲' },
      { title: 'Week 12: Thanksgiving Madness', description: 'Turkey and chaos', emoji: '🦃' },
      { title: 'Week 13: Playoff Picture', description: 'Who\'s in, who\'s out?', emoji: '🏈' },
      { title: 'Week 14: Playoff Week 1', description: 'Do or die', emoji: '💀' },
      { title: 'Week 15: Playoff Semifinals', description: 'So close to the finals', emoji: '🔥' },
      { title: 'Week 16: Championship Week', description: 'One game away from glory', emoji: '👑' },
      { title: 'Week 17: The Finals', description: 'ALL-IN for the championship', emoji: '🏆' }
    ];

    return flavors[week - 1] || flavors[0];
  }
};
