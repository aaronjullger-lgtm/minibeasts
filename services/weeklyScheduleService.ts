/**
 * Weekly Schedule Service
 * 
 * Manages the real-time clock and weekly phases:
 * - Monday-Wednesday: Surveillance Phase
 * - Thursday: The Lines Drop
 * - Friday-Saturday: The Action
 * - Sunday: The Climax
 * - Monday Morning: Judgment Day
 */

import { WeeklyPhase, WeeklySchedule } from '../types';
import { WEEKLY_SCHEDULE_CONFIG } from '../constants-overseer';

class WeeklyScheduleService {
    private schedule: WeeklySchedule = {
        currentPhase: 'surveillance',
        phaseStartTime: Date.now(),
        phaseEndTime: this.calculatePhaseEnd('surveillance'),
        weekNumber: 1
    };

    /**
     * Get current week and phase
     */
    getCurrentSchedule(): WeeklySchedule {
        // Check if phase has ended and update if necessary
        this.updatePhaseIfNeeded();
        return { ...this.schedule };
    }

    /**
     * Get the current phase
     */
    getCurrentPhase(): WeeklyPhase {
        this.updatePhaseIfNeeded();
        return this.schedule.currentPhase;
    }

    /**
     * Check if we need to transition to next phase
     */
    private updatePhaseIfNeeded(): void {
        if (Date.now() >= this.schedule.phaseEndTime) {
            this.transitionToNextPhase();
        }
    }

    /**
     * Transition to the next phase in the weekly cycle
     */
    private transitionToNextPhase(): void {
        const phaseOrder: WeeklyPhase[] = [
            'surveillance',
            'lines_drop',
            'action',
            'climax',
            'judgment'
        ];

        const currentIndex = phaseOrder.indexOf(this.schedule.currentPhase);
        const nextIndex = (currentIndex + 1) % phaseOrder.length;
        const nextPhase = phaseOrder[nextIndex];

        // If we're cycling back to surveillance, increment week
        if (nextPhase === 'surveillance') {
            this.schedule.weekNumber++;
        }

        this.schedule.currentPhase = nextPhase;
        this.schedule.phaseStartTime = Date.now();
        this.schedule.phaseEndTime = this.calculatePhaseEnd(nextPhase);

        console.log(`Phase transition: ${nextPhase} (Week ${this.schedule.weekNumber})`);
    }

    /**
     * Calculate when a phase should end based on its duration
     */
    private calculatePhaseEnd(phase: WeeklyPhase): number {
        const now = Date.now();
        const hoursToMs = (hours: number) => hours * 60 * 60 * 1000;

        switch (phase) {
            case 'surveillance':
                return now + hoursToMs(72); // 3 days
            case 'lines_drop':
                return now + hoursToMs(24); // 1 day
            case 'action':
                return now + hoursToMs(48); // 2 days
            case 'climax':
                return now + hoursToMs(24); // 1 day
            case 'judgment':
                return now + hoursToMs(6);  // Monday morning only
            default:
                return now + hoursToMs(24);
        }
    }

    /**
     * Get time remaining in current phase
     */
    getTimeRemainingInPhase(): {
        hours: number;
        minutes: number;
        seconds: number;
    } {
        const remaining = Math.max(0, this.schedule.phaseEndTime - Date.now());
        
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        return { hours, minutes, seconds };
    }

    /**
     * Check if we're in a specific phase
     */
    isInPhase(phase: WeeklyPhase): boolean {
        this.updatePhaseIfNeeded();
        return this.schedule.currentPhase === phase;
    }

    /**
     * Check if betting is allowed (action or climax phases)
     */
    isBettingOpen(): boolean {
        const phase = this.getCurrentPhase();
        return phase === 'action' || phase === 'climax';
    }

    /**
     * Check if voting is allowed (climax phase)
     */
    isVotingOpen(): boolean {
        return this.getCurrentPhase() === 'climax';
    }

    /**
     * Check if it's time for store refresh (Tuesday 3 AM)
     */
    isStoreRefreshTime(): boolean {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
        const hour = now.getHours();

        return day === 2 && hour === WEEKLY_SCHEDULE_CONFIG.storeRefreshHour;
    }

    /**
     * Manually advance to next phase (for testing/admin)
     */
    forceNextPhase(): void {
        this.transitionToNextPhase();
    }

    /**
     * Manually set phase (for testing/admin)
     */
    forceSetPhase(phase: WeeklyPhase): void {
        this.schedule.currentPhase = phase;
        this.schedule.phaseStartTime = Date.now();
        this.schedule.phaseEndTime = this.calculatePhaseEnd(phase);
    }

    /**
     * Get the current week number
     */
    getCurrentWeek(): number {
        return this.schedule.weekNumber;
    }

    /**
     * Set week number (for testing/admin)
     */
    setWeek(weekNumber: number): void {
        this.schedule.weekNumber = weekNumber;
    }

    /**
     * Get phase description for UI
     */
    getPhaseDescription(phase?: WeeklyPhase): string {
        const targetPhase = phase || this.getCurrentPhase();

        const descriptions: { [key in WeeklyPhase]: string } = {
            surveillance: 'The Overseer is watching... Flag messages and submit bet suggestions.',
            lines_drop: 'The betting board is live! Review lines and prepare your strategy.',
            action: 'Betting window is open! Place your bets and activate power-ups.',
            climax: 'Game day! Bets are resolving and voting is open for The Tribunal.',
            judgment: 'Judgment Day! Reviewing the week\'s winners, losers, and receipts.'
        };

        return descriptions[targetPhase];
    }

    /**
     * Get phase icon for UI
     */
    getPhaseIcon(phase?: WeeklyPhase): string {
        const targetPhase = phase || this.getCurrentPhase();

        const icons: { [key in WeeklyPhase]: string } = {
            surveillance: '👁️',
            lines_drop: '📊',
            action: '🎯',
            climax: '🏈',
            judgment: '⚖️'
        };

        return icons[targetPhase];
    }

    /**
     * Get full phase info for UI
     */
    getPhaseInfo(): {
        phase: WeeklyPhase;
        icon: string;
        description: string;
        timeRemaining: { hours: number; minutes: number; seconds: number };
        weekNumber: number;
    } {
        const phase = this.getCurrentPhase();
        
        return {
            phase,
            icon: this.getPhaseIcon(phase),
            description: this.getPhaseDescription(phase),
            timeRemaining: this.getTimeRemainingInPhase(),
            weekNumber: this.schedule.weekNumber
        };
    }

    /**
     * Reset schedule for new season
     */
    resetSchedule(): void {
        this.schedule = {
            currentPhase: 'surveillance',
            phaseStartTime: Date.now(),
            phaseEndTime: this.calculatePhaseEnd('surveillance'),
            weekNumber: 1
        };
    }

    /**
     * Get phase schedule for the week (for UI display)
     */
    getWeeklySchedule(): {
        phase: WeeklyPhase;
        day: string;
        description: string;
    }[] {
        return [
            {
                phase: 'surveillance',
                day: 'Monday - Wednesday',
                description: 'Chat monitoring, message flagging, Town Hall suggestions'
            },
            {
                phase: 'lines_drop',
                day: 'Thursday',
                description: 'Betting board published, trading markets open'
            },
            {
                phase: 'action',
                day: 'Friday - Saturday',
                description: 'Betting window open, power-up activation'
            },
            {
                phase: 'climax',
                day: 'Sunday',
                description: 'The Hunt (NFL parlays), Tribunal voting closes'
            },
            {
                phase: 'judgment',
                day: 'Monday Morning',
                description: 'Weekly recap, winners/losers, evidence reveal'
            }
        ];
    }
}

export const weeklyScheduleService = new WeeklyScheduleService();
