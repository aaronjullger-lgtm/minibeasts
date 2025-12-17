/**
 * Activity Monitoring Service
 * 
 * Handles anti-ghosting detection for Ambush bets:
 * - Tracks player activity during surveillance phase (Mon-Wed)
 * - Monitors activity during betting window (Fri-Sun)
 * - Detects ghosting (>70% drop in activity)
 */

import { PlayerActivityBaseline, PlayerActivityCheck, ChatMessage } from '../types';

class ActivityMonitoringService {
    private baselines: Map<string, PlayerActivityBaseline> = new Map();

    /**
     * Establish baseline activity during surveillance phase (Mon-Wed)
     */
    establishBaseline(
        playerId: string,
        messages: ChatMessage[],
        surveillanceStartTime: number,
        surveillanceEndTime: number
    ): PlayerActivityBaseline {
        // Count messages from this player during surveillance phase
        const playerMessages = messages.filter(
            msg => msg.senderId === playerId && 
                   msg.timestamp >= surveillanceStartTime && 
                   msg.timestamp <= surveillanceEndTime
        );

        const baseline: PlayerActivityBaseline = {
            playerId,
            baselineMessageCount: playerMessages.length,
            surveillanceStartTime,
            surveillanceEndTime
        };

        this.baselines.set(playerId, baseline);
        return baseline;
    }

    /**
     * Check if player is ghosting during betting window (Fri-Sun)
     * Returns true if activity dropped >70% from baseline
     */
    checkForGhosting(
        playerId: string,
        messages: ChatMessage[],
        bettingWindowStart: number,
        bettingWindowEnd: number
    ): PlayerActivityCheck {
        const baseline = this.baselines.get(playerId);
        
        if (!baseline) {
            throw new Error(`No baseline established for player ${playerId}`);
        }

        // Count messages during betting window
        const currentMessages = messages.filter(
            msg => msg.senderId === playerId && 
                   msg.timestamp >= bettingWindowStart && 
                   msg.timestamp <= bettingWindowEnd
        );

        const currentCount = currentMessages.length;
        const baselineCount = baseline.baselineMessageCount;

        // Calculate activity drop percentage
        let activityDropPercentage = 0;
        if (baselineCount > 0) {
            activityDropPercentage = ((baselineCount - currentCount) / baselineCount) * 100;
        }

        const isGhosting = activityDropPercentage > 70;

        return {
            playerId,
            currentMessageCount: currentCount,
            baselineCount,
            activityDropPercentage,
            isGhosting,
            checkTime: Date.now()
        };
    }

    /**
     * Get baseline for a player
     */
    getBaseline(playerId: string): PlayerActivityBaseline | undefined {
        return this.baselines.get(playerId);
    }

    /**
     * Clear all baselines (e.g., at start of new week)
     */
    clearBaselines(): void {
        this.baselines.clear();
    }

    /**
     * Clear baseline for specific player
     */
    clearPlayerBaseline(playerId: string): void {
        this.baselines.delete(playerId);
    }
}

export const activityMonitoringService = new ActivityMonitoringService();
