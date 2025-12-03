// Global game state for Dynasty Mode
export interface GlobalState {
  cringeMeter: number; // 0-100
  entertainmentMeter: number; // 0-100
  season: number;
  week: number; // 1-17
  day: number; // 1-7
}

// Character definition mapping characterId to their unique stat name
export interface CharacterDef {
  characterId: string;
  uniqueStatName: string; // e.g., 'Grades' for Aaron, 'Audit Risk' for Elie
}

export interface CharacterData {
  id: string;
  name: string;
  rank: number;
  girlfriend: boolean;
  wife?: boolean;
  nflTeamColor: string;
  bio: string;
}

export interface PlayerState extends CharacterData {
  grit: number; // Currency
  loveLife: number; // 0-100
  fandom: number; // 0-100
  uniqueStatValue: number; // 0-100, the value of their character-specific unique stat
  energy: number; // Daily Action Points, max 3
  happiness: number;
  // Character-specific stats (legacy, kept for backwards compatibility)
  paSchoolStress: number; // Aaron
  insecurity: number; // Craif
  liberalGfSuspicion: number; // Colin
  truckMaintenance: number; // Andrew
  ego: number; // Elie
  parlayAddiction?: number; // Colin
  commishPower?: number; // Spencer
  clout?: number; // Pace
  unlockedAchievements: string[];
}

export interface StoreItem {
  id: string;
  name: string;
  cost: number;
  desc: string;
  type: 'consumable' | 'permanent';
}

// Item interface for Dynasty Mode
// Items can affect either player-specific stats or global meters
export interface Item {
  id: string;
  name: string;
  cost: number; // Cost in grit
  desc: string;
  // Target stat can be:
  // - Player stats: loveLife, fandom, uniqueStatValue, energy
  // - Global stats: cringeMeter, entertainmentMeter
  targetStat: 'loveLife' | 'fandom' | 'uniqueStatValue' | 'energy' | 'cringeMeter' | 'entertainmentMeter';
  statEffect: number; // How much it affects the target stat (positive or negative)
  isCharacterSpecific?: string; // Optional character ID if item is specific to a character
  type?: 'consumable' | 'permanent';
}

export interface Message {
  speaker: string;
  text: string;
  // 'user' is the player, 'model' is AI/NPC, 'system' is for game events
  role: 'user' | 'model' | 'system';
}

export interface EndGameReport {
    title: string;
    message: string;
    isEnd: boolean;
}

export type GameState = 'intro' | 'select' | 'playing' | 'ended';

export type MinigameType = 'kicking' | 'quarterback' | 'play_calling' | 'running_back' | 'fantasy_draft' | 'commentary_battle' | 'trivia_night' | 'beer_die' | 'sunday_scaries' | 'commish_chaos' | 'ty_window' | 'bitchless_chronicles';

export interface SeasonGoal {
  id: string;
  description: string;
  isCompleted: boolean;
  gritReward: number;
}

export interface ManageLifeAction {
    name:string;
    cost: number;
    updates: Partial<PlayerState>;
    message: string;
    chatAction?: {
      targetId: string;
      playerMessage: string;
    }
}

export interface RandomEvent {
  id: string;
  trigger: (player: PlayerState, day: number, week: number) => boolean;
  message: string;
  effects: Partial<PlayerState>;
  grit?: number;
}

export interface PropBet {
    id: string;
    text: string;
    wager: number;
    isResolved: boolean;
    isCorrect: boolean | null; // Can be null if it just expires
    check: (history: Message[], player: PlayerState) => boolean | null;
    createdAtIndex: number;
    playerChoice: 'yes' | 'no' | null;
    isLocked: boolean;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
}

export interface GameEvent {
    id: string;
    name: string;
    description: string;
    effects: Array<{
        targetStat: 'loveLife' | 'fandom' | 'uniqueStatValue' | 'energy' | 'cringeMeter' | 'entertainmentMeter' | 'grit';
        value: number;
    }>;
}