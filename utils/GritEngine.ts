import Decimal from 'decimal.js';

/**
 * GritEngine - High-precision financial calculation service for The Board
 * Uses decimal.js to eliminate floating-point errors in all grit calculations
 */

/**
 * Calculate payout profit from American odds
 * @param stake - Amount of grit wagered
 * @param odds - American odds (e.g., +150 or -110)
 * @returns Profit amount (not including original stake)
 */
export function calculatePayout(stake: number, odds: number): number {
  const stakeDecimal = new Decimal(stake);
  
  if (odds > 0) {
    // Positive odds: stake × (odds / 100)
    // Example: 100 grit at +150 = 100 × (150/100) = 150 profit
    return stakeDecimal.mul(odds).div(100).toNumber();
  } else {
    // Negative odds: stake × (100 / |odds|)
    // Example: 100 grit at -110 = 100 × (100/110) = 90.91 profit
    return stakeDecimal.mul(100).div(Math.abs(odds)).toNumber();
  }
}

/**
 * Calculate Nitro Boost multiplier for Squad Ride
 * Formula: Final Payout = (Base Odds × Stake) × (1 + (0.05 × n))
 * @param basePayout - Base payout before multiplier
 * @param passengerCount - Number of passengers on the ride
 * @returns Boosted payout amount
 */
export function calculateNitro(basePayout: number, passengerCount: number): number {
  const baseDecimal = new Decimal(basePayout);
  const multiplier = new Decimal(1).plus(new Decimal(0.05).mul(passengerCount));
  
  return baseDecimal.mul(multiplier).toNumber();
}

/**
 * Check if user is ghosting (activity dropped >70%)
 * @param weeklyBaseline - Average activity during surveillance phase (Mon-Wed)
 * @param sundayActivity - Activity during betting window (Fri-Sun)
 * @returns true if user is ghosting (activity < 30% of baseline)
 */
export function isGhosting(weeklyBaseline: number, sundayActivity: number): boolean {
  const threshold = new Decimal(weeklyBaseline).mul(0.30).toNumber();
  return sundayActivity < threshold;
}

/**
 * Apply 5% Commish Cut (league fee) to payout
 * @param amount - Gross payout amount
 * @returns Net amount after 5% deduction
 */
export function applyCommishTax(amount: number): number {
  return new Decimal(amount).mul(0.95).toNumber();
}

/**
 * Convert American odds to decimal odds
 * @param americanOdds - American odds (e.g., +150 or -110)
 * @returns Decimal odds (e.g., 2.50)
 */
export function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return new Decimal(americanOdds).div(100).plus(1).toNumber();
  } else {
    return new Decimal(100).div(Math.abs(americanOdds)).plus(1).toNumber();
  }
}

/**
 * Convert decimal odds to American odds
 * @param decimalOdds - Decimal odds (e.g., 2.50)
 * @returns American odds (e.g., +150)
 */
export function decimalToAmerican(decimalOdds: number): number {
  if (decimalOdds >= 2) {
    return new Decimal(decimalOdds).minus(1).mul(100).toNumber();
  } else {
    return new Decimal(-100).div(new Decimal(decimalOdds).minus(1)).toNumber();
  }
}

/**
 * Calculate parlay odds from multiple legs
 * @param legs - Array of decimal odds for each leg
 * @returns Combined decimal odds for parlay
 */
export function calculateParlayOdds(legs: number[]): number {
  let totalOdds = new Decimal(1);
  
  for (const leg of legs) {
    totalOdds = totalOdds.mul(leg);
  }
  
  return totalOdds.toNumber();
}

/**
 * Calculate total payout including original stake
 * @param stake - Amount wagered
 * @param odds - American odds
 * @returns Total payout (profit + original stake)
 */
export function calculateTotalPayout(stake: number, odds: number): number {
  const profit = calculatePayout(stake, odds);
  return new Decimal(stake).plus(profit).toNumber();
}
