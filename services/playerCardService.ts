import { Player, PlayerCardData, EquipmentSlot, PlayerStreak, RapSheetEntry, RoastReaction, PlayerPassiveBuff, AmbushBet, GulagEntry, InventoryItem } from '../types';

/**
 * Player Card Service
 * Manages player profiles, equipment, passive buffs, and rap sheets
 */

/**
 * Get complete player card data including stats, equipment, and rap sheet
 */
export function getPlayerCardData(playerId: string, allPlayers: Player[], ambushBets: AmbushBet[], gulagHistory: GulagEntry[]): PlayerCardData {
  const player = allPlayers.find(p => p.id === playerId);
  if (!player) {
    throw new Error(`Player ${playerId} not found`);
  }

  const streak = calculatePlayerStreak(player, ambushBets);
  const rapSheet = generateRapSheet(player, ambushBets, gulagHistory);
  const passiveBuffs = calculatePlayerPassiveBuffs(player);
  const totalGulagDays = calculateTotalGulagDays(player, gulagHistory);

  return {
    playerId: player.id,
    playerName: player.name,
    avatarUrl: player.avatarUrl || '',
    currentGrit: player.grit,
    totalItems: player.inventory?.length || 0,
    winRate: calculateWinRate(player, ambushBets),
    streak,
    equipmentSlots: player.equipmentSlots || getDefaultEquipmentSlots(),
    passiveBuffs,
    rapSheet,
    totalGulagDays,
    bankruptcyCount: gulagHistory.filter(g => g.playerId === playerId).length,
    hasGrail: hasGrailItem(player),
  };
}

/**
 * Calculate player's current win/loss streak
 */
function calculatePlayerStreak(player: Player, ambushBets: AmbushBet[]): PlayerStreak {
  // Get player's resolved bets sorted by resolution date (most recent first)
  const playerBets = ambushBets
    .filter(bet => 
      (bet.bettorId === player.id || bet.targetUserId === player.id) && 
      bet.status === 'resolved' &&
      bet.resolvedAt
    )
    .sort((a, b) => {
      const dateA = a.resolvedAt ? new Date(a.resolvedAt).getTime() : 0;
      const dateB = b.resolvedAt ? new Date(b.resolvedAt).getTime() : 0;
      return dateB - dateA;
    });

  if (playerBets.length === 0) {
    return {
      type: 'none',
      count: 0,
    };
  }

  // Determine if most recent bet was a win or loss for this player
  const mostRecent = playerBets[0];
  let isWin = false;

  if (mostRecent.bettorId === player.id) {
    // Player was bettor - win if result is 'won'
    isWin = mostRecent.result === 'won';
  } else {
    // Player was target - win if result is 'subject_wins'
    isWin = mostRecent.result === 'subject_wins';
  }

  // Count consecutive wins or losses from most recent
  let streakCount = 0;
  for (const bet of playerBets) {
    let betIsWin = false;
    
    if (bet.bettorId === player.id) {
      betIsWin = bet.result === 'won';
    } else {
      betIsWin = bet.result === 'subject_wins';
    }

    if (betIsWin === isWin) {
      streakCount++;
    } else {
      break;
    }
  }

  return {
    type: isWin ? 'win' : 'loss',
    count: streakCount,
  };
}

/**
 * Calculate player's overall win rate
 */
function calculateWinRate(player: Player, ambushBets: AmbushBet[]): number {
  const resolvedBets = ambushBets.filter(bet => 
    (bet.bettorId === player.id || bet.targetUserId === player.id) && 
    bet.status === 'resolved'
  );

  if (resolvedBets.length === 0) {
    return 0;
  }

  const wins = resolvedBets.filter(bet => {
    if (bet.bettorId === player.id) {
      return bet.result === 'won';
    } else {
      return bet.result === 'subject_wins';
    }
  }).length;

  return Math.round((wins / resolvedBets.length) * 100);
}

/**
 * Generate rap sheet with recent losses and gulag history
 */
function generateRapSheet(player: Player, ambushBets: AmbushBet[], gulagHistory: GulagEntry[]): RapSheetEntry[] {
  const entries: RapSheetEntry[] = [];

  // Add recent losses (last 5)
  const losses = ambushBets
    .filter(bet => {
      if (bet.status !== 'resolved') return false;
      
      if (bet.bettorId === player.id) {
        return bet.result === 'lost' || bet.result === 'ghosting_penalty';
      } else if (bet.targetUserId === player.id) {
        return bet.result === 'won'; // Target lost when bettors won
      }
      return false;
    })
    .sort((a, b) => {
      const dateA = a.resolvedAt ? new Date(a.resolvedAt).getTime() : 0;
      const dateB = b.resolvedAt ? new Date(b.resolvedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  for (const bet of losses) {
    const gritLost = bet.bettorId === player.id ? bet.wager : (bet.potentialPayout || 0);
    
    entries.push({
      type: 'loss',
      date: bet.resolvedAt || new Date().toISOString(),
      description: `Lost ${gritLost} Grit - ${bet.description?.substring(0, 50) || 'Ambush bet'}`,
      amount: gritLost,
      linkedVerdictId: bet.id,
    });
  }

  // Add gulag entries
  const playerGulagEntries = gulagHistory
    .filter(g => g.playerId === player.id)
    .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime())
    .slice(0, 3); // Last 3 gulag entries

  for (const gulag of playerGulagEntries) {
    const days = gulag.exitedAt 
      ? Math.ceil((new Date(gulag.exitedAt).getTime() - new Date(gulag.enteredAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    entries.push({
      type: 'gulag',
      date: gulag.enteredAt,
      description: `Served ${days} days in the Gulag`,
      amount: 0,
      linkedVerdictId: gulag.hailMaryBet?.id,
    });
  }

  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Calculate total days spent in Gulag
 */
function calculateTotalGulagDays(player: Player, gulagHistory: GulagEntry[]): number {
  const playerEntries = gulagHistory.filter(g => g.playerId === player.id && g.exitedAt);
  
  return playerEntries.reduce((total, entry) => {
    const days = Math.ceil(
      (new Date(entry.exitedAt!).getTime() - new Date(entry.enteredAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return total + days;
  }, 0);
}

/**
 * Calculate all passive buffs from equipped items
 * SERVER-SIDE ONLY - prevents client manipulation
 */
export function calculatePlayerPassiveBuffs(player: Player): PlayerPassiveBuff[] {
  const buffs: PlayerPassiveBuff[] = [];

  if (!player.equipmentSlots) {
    return buffs;
  }

  for (const slot of player.equipmentSlots) {
    if (!slot.equippedItem) continue;

    const item = slot.equippedItem;

    // Map item effects to passive buffs
    switch (item.id) {
      case 'terrys_jersey':
        buffs.push({
          itemId: item.id,
          itemName: item.name,
          buffType: 'payout_multiplier',
          value: 0.10, // +10%
          description: '+10% Payout on all winning bets',
        });
        break;

      case 'the_shield':
        buffs.push({
          itemId: item.id,
          itemName: item.name,
          buffType: 'penalty_block',
          value: 1, // Block 1 penalty
          description: 'Block 1 penalty or tribunal vote',
        });
        break;

      case 'the_veto':
        buffs.push({
          itemId: item.id,
          itemName: item.name,
          buffType: 'tribunal_immunity',
          value: 1, // Cancel 1 vote
          description: 'Cancel 1 tribunal vote against you',
        });
        break;

      case 'lucky_charm':
        buffs.push({
          itemId: item.id,
          itemName: item.name,
          buffType: 'win_rate_boost',
          value: 0.05, // +5%
          description: '+5% increased bet success rate',
        });
        break;

      case 'waiver_discount':
        buffs.push({
          itemId: item.id,
          itemName: item.name,
          buffType: 'waiver_discount',
          value: 0.15, // 15% discount
          description: '15% discount on waiver bids',
        });
        break;

      case 'grit_magnet':
        buffs.push({
          itemId: item.id,
          itemName: item.name,
          buffType: 'grit_earnings_boost',
          value: 0.08, // +8%
          description: '+8% bonus Grit on all earnings',
        });
        break;

      default:
        // Custom passive buffs from item metadata
        if (item.passiveBuff) {
          buffs.push({
            itemId: item.id,
            itemName: item.name,
            buffType: item.passiveBuff.type,
            value: item.passiveBuff.value,
            description: item.passiveBuff.description,
          });
        }
    }
  }

  return buffs;
}

/**
 * Apply passive buff multipliers to a payout amount
 */
export function applyPassiveBuffs(baseAmount: number, player: Player): number {
  const buffs = calculatePlayerPassiveBuffs(player);
  let finalAmount = baseAmount;

  for (const buff of buffs) {
    if (buff.buffType === 'payout_multiplier' || buff.buffType === 'grit_earnings_boost') {
      finalAmount *= (1 + buff.value);
    }
  }

  return Math.round(finalAmount);
}

/**
 * Get default empty equipment slots
 */
function getDefaultEquipmentSlots(): EquipmentSlot[] {
  return [
    {
      slotId: 'offensive',
      slotName: 'Offensive',
      slotType: 'offensive',
      equippedItem: null,
    },
    {
      slotId: 'defensive',
      slotName: 'Defensive',
      slotType: 'defensive',
      equippedItem: null,
    },
    {
      slotId: 'utility',
      slotName: 'Utility',
      slotType: 'utility',
      equippedItem: null,
    },
  ];
}

/**
 * Equip an item to a slot
 */
export function equipItem(player: Player, itemId: string, slotId: string): Player {
  const item = player.inventory?.find(i => i.id === itemId);
  if (!item) {
    throw new Error(`Item ${itemId} not found in player inventory`);
  }

  if (!player.equipmentSlots) {
    player.equipmentSlots = getDefaultEquipmentSlots();
  }

  const slot = player.equipmentSlots.find(s => s.slotId === slotId);
  if (!slot) {
    throw new Error(`Slot ${slotId} not found`);
  }

  // Validate item can go in this slot
  const validSlot = getValidSlotForItem(item);
  if (validSlot !== slot.slotType) {
    throw new Error(`Item ${item.name} cannot be equipped in ${slot.slotName} slot`);
  }

  // Unequip previous item if any
  if (slot.equippedItem) {
    slot.equippedItem = null;
  }

  // Equip new item
  slot.equippedItem = item;

  return player;
}

/**
 * Unequip an item from a slot
 */
export function unequipItem(player: Player, slotId: string): Player {
  if (!player.equipmentSlots) {
    return player;
  }

  const slot = player.equipmentSlots.find(s => s.slotId === slotId);
  if (slot) {
    slot.equippedItem = null;
  }

  return player;
}

/**
 * Determine valid slot for an item based on its properties
 */
function getValidSlotForItem(item: InventoryItem): 'offensive' | 'defensive' | 'utility' {
  // Check item metadata for slot type
  if (item.metadata?.slotType) {
    return item.metadata.slotType as 'offensive' | 'defensive' | 'utility';
  }

  // Default logic based on item ID/name
  const offensiveKeywords = ['multiplier', 'boost', 'payout', 'charm', 'magnet'];
  const defensiveKeywords = ['shield', 'veto', 'block', 'immunity', 'protection'];
  
  const itemLower = (item.name + item.id).toLowerCase();

  if (defensiveKeywords.some(kw => itemLower.includes(kw))) {
    return 'defensive';
  }

  if (offensiveKeywords.some(kw => itemLower.includes(kw))) {
    return 'offensive';
  }

  return 'utility';
}

/**
 * Check if player has a Grail item (1-of-1)
 */
function hasGrailItem(player: Player): boolean {
  if (!player.inventory) return false;
  return player.inventory.some(item => item.rarity === 'grail');
}

/**
 * Send a roast reaction to a player
 */
export function sendRoastReaction(fromPlayerId: string, toPlayerId: string, reactionType: '🤓' | 'L'): RoastReaction {
  return {
    id: `roast_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    fromPlayerId,
    toPlayerId,
    reactionType,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10000).toISOString(), // 10 seconds
  };
}

/**
 * Get active roast reactions for a player (not expired)
 */
export function getActiveRoastReactions(playerId: string, allReactions: RoastReaction[]): RoastReaction[] {
  const now = new Date().getTime();
  
  return allReactions.filter(reaction => 
    reaction.toPlayerId === playerId &&
    new Date(reaction.expiresAt).getTime() > now
  );
}
