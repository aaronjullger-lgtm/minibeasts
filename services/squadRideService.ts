// Squad Ride Co-op Parlay Service
// Implements collaborative NFL parlays with Nitro Boost multipliers

import { SquadRide, SquadRidePassenger, ParlayLeg, SquadRideStatus, NitroBoostLevel, Player } from '../types';

// Constants
const MINIMUM_STAKE = 50; // Minimum grit to join a ride
const NITRO_BOOST_RATE = 0.05; // 5% boost per passenger
const MIN_PARLAY_ODDS = 150; // +150 minimum
const MAX_PARLAY_ODDS = 2000; // +2000 maximum
const SQUAD_RIDE_DURATION_MS = 1000 * 60 * 60 * 72; // 72 hours (Fri-Sun)

/**
 * Creates a new Squad Ride (3-leg NFL parlay)
 * Driver sets up the parlay and becomes the first passenger
 */
export function createSquadRide(
  driverId: string,
  driverName: string,
  parlayLegs: ParlayLeg[],
  initialStake: number
): SquadRide {
  // Validation
  if (parlayLegs.length !== 3) {
    throw new Error('Squad Ride must have exactly 3 parlay legs');
  }

  if (initialStake < MINIMUM_STAKE) {
    throw new Error(`Minimum stake is ${MINIMUM_STAKE} grit`);
  }

  // Validate odds are within acceptable range
  const totalOdds = calculateParlayOdds(parlayLegs);
  if (totalOdds < MIN_PARLAY_ODDS || totalOdds > MAX_PARLAY_ODDS) {
    throw new Error(`Parlay odds must be between +${MIN_PARLAY_ODDS} and +${MAX_PARLAY_ODDS}`);
  }

  // Ensure 3 different games (no same-game parlays)
  const gameIds = parlayLegs.map(leg => leg.gameId);
  if (new Set(gameIds).size !== 3) {
    throw new Error('Parlay legs must be from 3 different games');
  }

  const now = Date.now();
  const driver: SquadRidePassenger = {
    playerId: driverId,
    playerName: driverName,
    stake: initialStake,
    joinedAt: now,
    isDriver: true
  };

  return {
    id: `squad_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    driverId,
    driverName,
    parlayLegs,
    passengers: [driver],
    status: 'open',
    createdAt: now,
    expiresAt: now + SQUAD_RIDE_DURATION_MS,
    totalPot: initialStake,
    nitroBoostMultiplier: 1.0,
    minStake: MINIMUM_STAKE
  };
}

/**
 * Join an existing Squad Ride
 * Locks grit in escrow until ride resolves
 */
export function joinSquadRide(
  ride: SquadRide,
  playerId: string,
  playerName: string,
  stake: number,
  playerGrit: number
): { updatedRide: SquadRide; lockedGrit: number } {
  // Validation
  if (ride.status !== 'open') {
    throw new Error('This ride is no longer accepting passengers');
  }

  if (stake < ride.minStake) {
    throw new Error(`Minimum stake for this ride is ${ride.minStake} grit`);
  }

  if (playerGrit < stake) {
    throw new Error('Insufficient grit balance');
  }

  // Check if already joined
  if (ride.passengers.some(p => p.playerId === playerId)) {
    throw new Error('You are already on this ride');
  }

  const passenger: SquadRidePassenger = {
    playerId,
    playerName,
    stake,
    joinedAt: Date.now(),
    isDriver: false
  };

  const updatedPassengers = [...ride.passengers, passenger];
  const newTotalPot = ride.totalPot + stake;
  const newNitroBoost = calculateNitroBoost(updatedPassengers.length);

  const updatedRide: SquadRide = {
    ...ride,
    passengers: updatedPassengers,
    totalPot: newTotalPot,
    nitroBoostMultiplier: newNitroBoost
  };

  return {
    updatedRide,
    lockedGrit: stake
  };
}

/**
 * Calculate Nitro Boost multiplier based on passenger count
 * Formula: 1 + (0.05 × n) where n = number of passengers
 */
export function calculateNitroBoost(passengerCount: number): number {
  return 1 + (NITRO_BOOST_RATE * passengerCount);
}

/**
 * Get Nitro Boost level/tier information
 */
export function getNitroBoostLevel(passengerCount: number): NitroBoostLevel {
  const multiplier = calculateNitroBoost(passengerCount);

  if (passengerCount >= 20) {
    return {
      tier: 'NITRO MAXED',
      emoji: '💥',
      multiplier,
      color: '#ff0000',
      minPassengers: 20,
      maxPassengers: 999
    };
  } else if (passengerCount >= 15) {
    return {
      tier: 'ON FIRE',
      emoji: '🔥🔥🔥🔥',
      multiplier,
      color: '#ff3333',
      minPassengers: 15,
      maxPassengers: 19
    };
  } else if (passengerCount >= 10) {
    return {
      tier: 'HOT',
      emoji: '🔥🔥🔥',
      multiplier,
      color: '#ff6666',
      minPassengers: 10,
      maxPassengers: 14
    };
  } else if (passengerCount >= 5) {
    return {
      tier: 'ROLLING',
      emoji: '🔥🔥',
      multiplier,
      color: '#ff9999',
      minPassengers: 5,
      maxPassengers: 9
    };
  } else {
    return {
      tier: 'WARMING UP',
      emoji: '🔥',
      multiplier,
      color: '#ffcccc',
      minPassengers: 1,
      maxPassengers: 4
    };
  }
}

/**
 * Calculate total parlay odds from legs
 * Converts American odds to decimal and multiplies
 */
export function calculateParlayOdds(legs: ParlayLeg[]): number {
  let combinedDecimal = 1.0;

  for (const leg of legs) {
    const decimalOdds = americanToDecimal(leg.odds);
    combinedDecimal *= decimalOdds;
  }

  // Convert back to American odds
  return decimalToAmerican(combinedDecimal);
}

/**
 * Convert American odds to decimal
 */
function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return (americanOdds / 100) + 1;
  } else {
    return (100 / Math.abs(americanOdds)) + 1;
  }
}

/**
 * Convert decimal odds to American
 */
function decimalToAmerican(decimalOdds: number): number {
  if (decimalOdds >= 2.0) {
    return Math.round((decimalOdds - 1) * 100);
  } else {
    return Math.round(-100 / (decimalOdds - 1));
  }
}

/**
 * Calculate individual payout for a passenger
 */
export function calculatePassengerPayout(
  stake: number,
  parlayOdds: number,
  nitroBoostMultiplier: number
): number {
  const decimalOdds = americanToDecimal(parlayOdds);
  const basePayout = stake * decimalOdds;
  const finalPayout = basePayout * nitroBoostMultiplier;
  return Math.round(finalPayout);
}

/**
 * Update parlay leg status during live games
 */
export function updateParlayLegStatus(
  ride: SquadRide,
  legIndex: number,
  won: boolean
): SquadRide {
  const updatedLegs = ride.parlayLegs.map((leg, idx) => {
    if (idx === legIndex) {
      return {
        ...leg,
        status: won ? 'won' : 'lost',
        resolvedAt: Date.now()
      };
    }
    return leg;
  });

  // Check if ride is complete
  let newStatus: SquadRideStatus = ride.status;
  const allResolved = updatedLegs.every(leg => leg.status !== 'pending');
  const anyLost = updatedLegs.some(leg => leg.status === 'lost');

  if (allResolved) {
    newStatus = anyLost ? 'failed' : 'completed';
  } else if (anyLost) {
    newStatus = 'failed';
  }

  return {
    ...ride,
    parlayLegs: updatedLegs,
    status: newStatus
  };
}

/**
 * Resolve squad ride and distribute payouts
 * Returns array of payouts for each passenger
 */
export function resolveSquadRide(ride: SquadRide): {
  payouts: Array<{ playerId: string; amount: number }>;
  driverBadge?: 'Fumbled the Squad' | 'Squad Captain';
} {
  if (ride.status !== 'completed' && ride.status !== 'failed') {
    throw new Error('Ride is not ready to resolve');
  }

  const payouts: Array<{ playerId: string; amount: number }> = [];

  if (ride.status === 'completed') {
    // All legs won - calculate payouts with Nitro Boost
    const parlayOdds = calculateParlayOdds(ride.parlayLegs);

    for (const passenger of ride.passengers) {
      const payout = calculatePassengerPayout(
        passenger.stake,
        parlayOdds,
        ride.nitroBoostMultiplier
      );
      payouts.push({
        playerId: passenger.playerId,
        amount: payout
      });
    }

    return {
      payouts,
      driverBadge: 'Squad Captain' // Success badge
    };
  } else {
    // Ride failed - no payouts, driver gets shame badge
    return {
      payouts: [], // Everyone loses their stake
      driverBadge: 'Fumbled the Squad' // Failure badge
    };
  }
}

/**
 * Lock/escrow grit for a passenger
 * This prevents the grit from being used elsewhere
 */
export function lockGritForRide(
  player: Player,
  amount: number
): { updatedPlayer: Player; lockedGrit: number } {
  if (!player.lockedGrit) {
    player.lockedGrit = 0;
  }

  const availableGrit = player.grit - player.lockedGrit;
  if (availableGrit < amount) {
    throw new Error('Insufficient available grit (some may be locked in other rides)');
  }

  return {
    updatedPlayer: {
      ...player,
      lockedGrit: (player.lockedGrit || 0) + amount
    },
    lockedGrit: amount
  };
}

/**
 * Release locked grit after ride resolves
 */
export function releaseLockedGrit(
  player: Player,
  amount: number
): Player {
  return {
    ...player,
    lockedGrit: Math.max(0, (player.lockedGrit || 0) - amount)
  };
}

/**
 * Get Squad Progress (percentage of legs completed)
 */
export function getSquadProgress(ride: SquadRide): {
  completedLegs: number;
  totalLegs: number;
  percentage: number;
  color: string;
} {
  const completedLegs = ride.parlayLegs.filter(leg => leg.status === 'won').length;
  const totalLegs = ride.parlayLegs.length;
  const percentage = (completedLegs / totalLegs) * 100;

  let color = '#6b7280'; // Grey
  if (completedLegs === 1) {
    color = '#fbbf24'; // Yellow
  } else if (completedLegs >= 2) {
    color = '#10b981'; // Green
  }

  return {
    completedLegs,
    totalLegs,
    percentage,
    color
  };
}

/**
 * Validate parlay legs against current NFL lines
 * This is a placeholder for AI Overseer validation
 */
export function validateParlayLegs(legs: ParlayLeg[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for stale lines (placeholder)
  for (const leg of legs) {
    if (leg.gameStartTime && leg.gameStartTime < Date.now()) {
      errors.push(`Game ${leg.gameId} has already started`);
    }
  }

  // Check odds are reasonable
  for (const leg of legs) {
    if (Math.abs(leg.odds) > 5000) {
      errors.push(`Odds ${leg.odds} for game ${leg.gameId} are unreasonable`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
