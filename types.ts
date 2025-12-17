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

export type GameState = 'intro' | 'select' | 'playing' | 'datingSim' | 'ended' | 'overseer';

export type MinigameType = 'kicking' | 'quarterback' | 'play_calling' | 'running_back' | 'fantasy_draft' | 'commentary_battle' | 'trivia_night' | 'beer_die' | 'sunday_scaries' | 'commish_chaos' | 'ty_window' | 'bitchless_chronicles' | 'overseer';

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

// Dating Sim Types
export type RejectionFlavor = 'mild' | 'standard' | 'brutal' | 'complete_disaster';

export interface DialogueChoice {
    text: string;
    response: string;
    insecurityGain: number;
}

export interface DatingChoice {
    situation: string;
    options: DialogueChoice[];
}

export interface DatingScenario {
    id: string;
    character: 'elie' | 'craif';
    description: string;
    choices: DatingChoice[];
}

// ============================================================================
// AI GAME MASTER "OVERSEER" SYSTEM TYPES
// ============================================================================

// Weekly Phase System
export type WeeklyPhase = 
    | 'surveillance'     // Monday-Wednesday: Chat monitoring, flagging
    | 'lines_drop'       // Thursday: Betting board published
    | 'action'           // Friday-Saturday: Betting window open
    | 'climax'           // Sunday: Resolutions and voting
    | 'judgment';        // Monday Morning: Recap and payouts

export interface WeeklySchedule {
    currentPhase: WeeklyPhase;
    phaseStartTime: number; // Timestamp
    phaseEndTime: number;   // Timestamp
    weekNumber: number;
}

// Item Rarity System
export type ItemRarity = 'brick' | 'mid' | 'heat' | 'grail'; // Grey, Blue, Gold, Red

export type ItemRarityLegacy = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface RarityConfig {
    rarity: ItemRarity;
    color: string; // 'grey', 'blue', 'gold', 'red'
    dropRate: number; // Percentage chance
    label: string; // 'Brick', 'Mid', 'Heat', 'Grail'
    utility: 'none' | 'minor' | 'high' | 'grail'; // Utility level
}

// Lore Items & Power-Ups
export interface LoreItem {
    id: string;
    name: string;
    description: string;
    rarity: ItemRarity;
    supply: number; // -1 for unlimited, positive number for limited
    currentSupply: number; // How many are left
    lore: string; // Inside joke or chat reference
    equipped: boolean;
    passiveBonus?: {
        betType?: string; // e.g., 'parlay', 'tribunal', 'prop'
        payoutMultiplier?: number; // e.g., 1.05 for +5%
        statBoost?: {
            stat: string;
            amount: number;
        };
    };
    passiveBuff?: {
        type: 'payout_multiplier' | 'grit_earnings_boost' | 'win_rate_boost' | 'waiver_discount' | 'penalty_block' | 'tribunal_immunity';
        value: number;
        description: string;
    };
    metadata?: {
        slotType?: 'offensive' | 'defensive' | 'utility';
        [key: string]: any;
    };
    type: 'lore' | 'consumable' | 'powerup';
    characterId?: string; // Optional character this belongs to
}

// Type alias for equipment-compatible items
export type InventoryItem = LoreItem;

export interface PowerUp {
    id: string;
    name: string;
    description: string;
    rarity: ItemRarity;
    cost: number; // Grit cost
    duration: number; // Duration in hours (168 = 7 days)
    purchasedAt?: number; // Timestamp when purchased
    expiresAt?: number; // Timestamp when it expires
    effect: 'veto' | 'lens' | 'shield' | 'multiplier' | 'insurance' | 'immunity';
    effectData?: any; // Additional data for the effect
}

// Mystery Box System
export type MysteryBoxTier = 'brown_paper_bag' | 'evidence_locker';

export interface MysteryBox {
    id: string;
    name: string;
    tier: MysteryBoxTier;
    cost: number; // Grit cost
    description: string;
    possibleItems: string[]; // Array of LoreItem IDs
    guaranteedRarity?: ItemRarity; // Minimum rarity guaranteed
}

// Trading System
export interface TradeOffer {
    id: string;
    sellerId: string;
    sellerName: string;
    itemId: string;
    price: number; // Grit price
    listedAt: number; // Timestamp
    status: 'active' | 'sold' | 'cancelled';
}

// Waiver Wire (Blind-Bid Liquidations)
export interface WaiverListing {
    id: string;
    itemId: string;
    originalOwnerId: string;
    originalOwnerName: string;
    listedAt: number;
    expiresAt: number; // 24 hours after listing
    status: 'active' | 'resolved' | 'cancelled';
    winningBid?: WaiverBid;
}

export interface WaiverBid {
    id: string;
    waiverListingId: string;
    bidderId: string;
    bidderName: string;
    bidAmount: number; // Grit amount (hidden until resolution)
    placedAt: number;
    won?: boolean; // Set when waiver resolves
}

// Multi-Item Trade System
export interface MultiItemTrade {
    id: string;
    proposerId: string;
    proposerName: string;
    proposerItems: string[]; // Up to 5 item IDs
    recipientId: string;
    recipientName: string;
    recipientItems: string[]; // Up to 5 item IDs
    proposedAt: number;
    status: 'pending' | 'accepted' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
    acceptedAt?: number; // First step lock
    confirmedAt?: number; // Second step lock (both parties must confirm)
}

export interface TradingFloor {
    offers: TradeOffer[];
    waiverListings: WaiverListing[];
    multiItemTrades: MultiItemTrade[];
    houseTaxRate: number; // Percentage (e.g., 0.05 for 5%)
}

// Betting Line System
export interface BettingLine {
    id: string;
    type: 'tribunal' | 'squad_ride' | 'sportsbook' | 'prop';
    description: string;
    odds: number; // American odds (e.g., +150, -110)
    isResolved: boolean;
    outcome?: boolean; // True = won, False = lost
    participants: string[]; // Player IDs who bet on this
    wagers: { [playerId: string]: number }; // Player ID -> Grit wagered
    createdAt: number; // Timestamp
    resolvedAt?: number; // Timestamp
    evidence?: string[]; // Chat message IDs or screenshots
}

// The Tribunal (Social Betting)
export interface TribunalSuperlative {
    id: string;
    title: string; // e.g., "Most Delusional Take"
    description: string;
    nominees: {
        playerId: string;
        playerName: string;
        odds: number; // American odds
        evidence: string[]; // Chat receipts
    }[];
    votes: { [playerId: string]: string }; // Voter ID -> Nominee ID
    votingClosesAt: number; // Timestamp (Sunday)
    winner?: string; // Player ID
    isResolved: boolean;
}

export interface TribunalBet {
    id: string;
    superlativeId: string;
    playerId: string;
    nomineeId: string; // Who they're betting on
    wager: number; // Grit wagered
    odds: number; // Odds at time of bet
    potentialPayout: number;
    isResolved: boolean;
    won?: boolean;
}

// The Squad Ride (Co-Op Parlay)
export interface SquadRideParlay {
    id: string;
    weekNumber: number;
    creatorId: string;
    creatorName: string;
    legs: ParlayLeg[];
    totalOdds: number;
    minOdds: number; // Minimum allowed odds
    maxOdds: number; // Maximum allowed odds
    riders: SquadRider[]; // Players who squad rode
    status: 'open' | 'locked' | 'in_progress' | 'won' | 'lost';
    resolvedAt?: number;
}

export interface ParlayLeg {
    id: string;
    game: string; // e.g., "Cowboys vs Eagles"
    pick: string; // e.g., "Cowboys -3.5"
    odds: number;
    isResolved: boolean;
    won?: boolean;
}

export interface SquadRider {
    playerId: string;
    playerName: string;
    wager: number; // Grit wagered
    multiplier: number; // Calculated based on number of riders
}

// The Sportsbook
export interface SportsbookBet {
    id: string;
    playerId: string;
    type: 'spread' | 'moneyline' | 'over_under' | 'prop';
    game?: string;
    description: string;
    pick: string;
    odds: number;
    wager: number;
    potentialPayout: number;
    isResolved: boolean;
    won?: boolean;
    aiVerified?: boolean; // For custom props
}

export interface CustomPropBet {
    id: string;
    description: string; // e.g., "Announcer mentions Taylor Swift"
    odds: number;
    game: string;
    verificationMethod: 'ai' | 'manual' | 'video_review';
    evidence?: string[]; // Video clips, timestamps, etc.
}

// The Ambush System (Information Asymmetry Betting)
export interface AmbushBet {
    id: string;
    bettorId: string;
    bettorName: string;
    targetUserId: string; // The person being bet on (target of the ambush)
    targetUserName: string;
    description: string; // e.g., "Will Wyatt mention the Ravens 3x today?"
    category: 'social' | 'behavior' | 'prop'; // Type of ambush bet
    odds: number; // American odds
    wager: number; // Grit wagered
    potentialPayout: number;
    isResolved: boolean;
    won?: boolean;
    createdAt: number;
    resolvedAt?: number;
    evidence?: string[]; // Chat receipts or proof
}

// Ambush Bets Filtered View
export interface AmbushBetsFilteredView {
    bettorBets: AmbushBet[]; // Bets where user is the bettor (full details)
    targetBets: {
        totalGritAgainst: number; // Total grit wagered against the target
        betCount: number; // Number of active bets against the target
        bets: Array<Omit<AmbushBet, 'description' | 'category'>>; // Redacted bet details
    };
}

// Activity Monitoring for Anti-Ghosting
export interface PlayerActivityBaseline {
    playerId: string;
    baselineMessageCount: number; // Messages during surveillance phase (Mon-Wed)
    surveillanceStartTime: number;
    surveillanceEndTime: number;
}

export interface PlayerActivityCheck {
    playerId: string;
    currentMessageCount: number; // Messages during betting window (Fri-Sun)
    baselineCount: number;
    activityDropPercentage: number; // How much activity dropped
    isGhosting: boolean; // True if activity dropped >70%
    checkTime: number;
}

// Ambush Resolution Result
export interface AmbushResolutionResult {
    betId: string;
    bettorsWon: boolean; // True if bettors won, false if subject won
    totalPot: number; // Total grit in the pot
    commishCut: number; // 5% league fee
    netPayout: number; // Amount after commish cut
    payouts: {
        playerId: string;
        playerName: string;
        amount: number;
    }[];
    subjectPayout?: number; // Only set if subject won
    ghostingDetected: boolean; // True if anti-ghosting triggered
    evidence: string[]; // Receipt links from Locker Room
    resolvedAt: number;
}

// Chat Monitoring & Evidence System
export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: number;
    flagged: boolean;
    flaggedBy?: string[]; // Player IDs who flagged
    usedInEvidence?: string[]; // Bet/Tribunal IDs this was used as evidence
}

export interface TownHallSuggestion {
    id: string;
    playerId: string;
    playerName: string;
    suggestion: string;
    betType: 'tribunal' | 'prop' | 'other';
    upvotes: string[]; // Player IDs who upvoted
    submittedAt: number;
    status: 'pending' | 'approved' | 'rejected' | 'implemented';
}

export interface EvidenceLocker {
    messages: ChatMessage[];
    screenshots: string[]; // URLs or base64 data
    receipts: { [betId: string]: string[] }; // Bet ID -> Evidence IDs
}

// Payday/Bankrupt Notification Events
export interface PaydayNotification {
    type: 'VAULT_TRANSFER';
    recipientId: string;
    recipientName: string;
    amount: number;
    message: string; // e.g., "YOU JUST TAXED THE BOYS FOR [X] GRIT"
    timestamp: number;
}

export interface BankruptNotification {
    type: 'AMBUSH_LOSS';
    loserId: string;
    loserName: string;
    amount: number;
    subjectId: string;
    subjectName: string;
    message: string; // e.g., "YOU GOT AMBUSHED. [SUBJECT] TOOK YOUR GRIT"
    timestamp: number;
}

// The Gulag (Punishment System)
export interface GulagState {
    playerId: string;
    playerName: string;
    inGulag: boolean; // True when grit hits 0
    gulagStartedAt?: number;
    banExpiresAt?: number; // For 7-day bans
    gulagBet?: GulagBet; // The "Hail Mary" redemption bet
    previousBankruptcies: number;
    bailoutOffered?: boolean; // True if someone offered to bail them out
    bailoutAmount?: number; // Amount needed for bailout
    irlPunishment?: string; // "The Tab" - voted IRL punishment
    rapSheet: string[]; // History of shame - previous gulag entries
}

export interface GulagBet {
    id: string;
    playerId: string;
    description: string; // AI-generated high-risk bet
    odds: number; // High-risk odds generated by AI (e.g., +500)
    wager: number; // Usually a fixed amount (starter pack size)
    isResolved: boolean;
    won?: boolean;
    redemptionAmount?: number; // Grit received if won (starter pack)
    irlPunishment?: string; // "The Tab" - IRL punishment if lost
    generatedAt: number; // Timestamp of generation (ensures uniqueness)
    type: 'exact_score' | 'social_prop' | 'multi_leg' | 'custom'; // Type of Hail Mary bet
}

export interface GulagBailout {
    id: string;
    prisonerId: string;
    prisonerName: string;
    bailerId: string;
    bailerName: string;
    bailAmount: number; // Massive grit amount
    timestamp: number;
    accepted: boolean;
}

// Judgment Day Recap
export interface JudgmentRecap {
    weekNumber: number;
    winners: {
        playerId: string;
        playerName: string;
        totalWinnings: number;
        biggestWin: {
            betId: string;
            description: string;
            payout: number;
        };
    }[];
    losers: {
        playerId: string;
        playerName: string;
        totalLosses: number;
        worstLoss: {
            betId: string;
            description: string;
            loss: number;
        };
    }[];
    receipts: {
        betId: string;
        evidence: string[]; // Chat message IDs or screenshots
        outcome: string;
        timestamp: string;
        verdict: string;
    }[];
    stats: {
        totalGritWagered: number;
        totalGritWon: number;
        totalGritLost: number;
        mostPopularBet: string;
        biggestUpset: string;
    };
    // New fields for Judgment Day Recap
    shadowLockReveals?: {
        targetName: string;
        triggerPhrase: string;
        success: boolean;
        bettorCount: number;
        totalGrit: number;
    }[];
    whaleOfWeek?: {
        playerName: string;
        totalWagered: number;
    };
    gulagInmate?: {
        playerName: string;
    };
    indictmentWinners?: {
        category: string;
        winnerName: string;
        votes: number;
        reason: string;
    }[];
    playerNewBalance?: number;
    playerItemsPulled?: number;
}

// AI Overseer State
export interface OverseerState {
    chatHistory: ChatMessage[];
    detectedTrends: {
        type: 'argument' | 'joke' | 'behavior' | 'rivalry';
        description: string;
        participants: string[];
        frequency: number;
        lastOccurrence: number;
    }[];
    generatedLines: BettingLine[];
    weeklySuperlatives: TribunalSuperlative[];
    activeSquadRide?: SquadRideParlay;
}

// Extended Player State for Overseer System
export interface OverseerPlayerState extends PlayerState {
    ownedItems: LoreItem[];
    equippedItems: string[]; // Item IDs
    equipmentSlots?: EquipmentSlot[]; // New equipment system
    activePowerUps: PowerUp[];
    tradeOffers: string[]; // TradeOffer IDs
    tribunalBets: TribunalBet[];
    squadRideBets: SquadRider[];
    sportsbookBets: SportsbookBet[];
    ambushBets: AmbushBet[]; // Bets placed on others (as bettor)
    ambushTargetBets: AmbushBet[]; // Bets where this player is the target (redacted details)
    gulagState?: GulagState;
    weeklyStats: {
        gritWagered: number;
        gritWon: number;
        gritLost: number;
        betsPlaced: number;
        betsWon: number;
    };
}

// Player Card & Rap Sheet System
export interface PlayerCardData {
    playerId: string;
    playerName: string;
    avatarUrl: string;
    currentGrit: number;
    totalItems: number;
    winRate: number; // 0-100
    streak: PlayerStreak;
    equipmentSlots: EquipmentSlot[];
    passiveBuffs: PlayerPassiveBuff[];
    rapSheet: RapSheetEntry[];
    totalGulagDays: number;
    bankruptcyCount: number;
    hasGrail: boolean;
}

export interface PlayerStreak {
    type: 'win' | 'loss' | 'none';
    count: number;
}

export interface EquipmentSlot {
    slotId: string;
    slotName: string;
    slotType: 'offensive' | 'defensive' | 'utility';
    equippedItem: InventoryItem | null;
}

export interface PlayerPassiveBuff {
    itemId: string;
    itemName: string;
    buffType: 'payout_multiplier' | 'grit_earnings_boost' | 'win_rate_boost' | 'waiver_discount' | 'penalty_block' | 'tribunal_immunity';
    value: number; // Percentage (0.10 = 10%) or count (1 = 1 block)
    description: string;
}

export interface RapSheetEntry {
    type: 'loss' | 'gulag';
    date: string; // ISO timestamp
    description: string;
    amount: number; // Grit lost (for losses)
    linkedVerdictId?: string; // Link to ambush bet or gulag entry
}

export interface RoastReaction {
    id: string;
    fromPlayerId: string;
    toPlayerId: string;
    reactionType: '🤓' | 'L';
    createdAt: string;
    expiresAt: string; // 10 seconds from creation
}