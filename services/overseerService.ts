/**
 * AI Overseer Service
 * 
 * The Overseer is the AI-driven game master that:
 * - Analyzes group chat logs
 * - Detects trends (arguments, jokes, behaviors)
 * - Generates betting lines
 * - Calculates odds
 * - Judges outcomes
 */

import { 
    OverseerState, 
    ChatMessage, 
    TribunalSuperlative, 
    BettingLine,
    TownHallSuggestion 
} from '../types';
import { generateText } from './geminiService';

class OverseerService {
    private state: OverseerState = {
        chatHistory: [],
        detectedTrends: [],
        generatedLines: [],
        weeklySuperlatives: [],
    };

    /**
     * Ingest a new chat message for analysis
     */
    addChatMessage(message: ChatMessage): void {
        this.state.chatHistory.push(message);
        
        // Limit history to last 1000 messages for performance
        if (this.state.chatHistory.length > 1000) {
            this.state.chatHistory = this.state.chatHistory.slice(-1000);
        }
    }

    /**
     * Flag a message for AI review
     */
    flagMessage(messageId: string, flaggedBy: string): void {
        const message = this.state.chatHistory.find(m => m.id === messageId);
        if (message) {
            message.flagged = true;
            if (!message.flaggedBy) {
                message.flaggedBy = [];
            }
            if (!message.flaggedBy.includes(flaggedBy)) {
                message.flaggedBy.push(flaggedBy);
            }
        }
    }

    /**
     * Analyze chat history to detect trends
     */
    async analyzeChatTrends(): Promise<void> {
        const recentMessages = this.state.chatHistory.slice(-200); // Last 200 messages
        
        if (recentMessages.length < 10) {
            return; // Not enough data
        }

        // Create a prompt for the AI to analyze trends
        const prompt = `Analyze this group chat history and identify recurring patterns, arguments, jokes, or behaviors:

${recentMessages.map(m => `${m.senderName}: ${m.content}`).join('\n')}

Identify:
1. Recurring arguments or debates (e.g., "Who's the best QB?")
2. Inside jokes or memes
3. Repetitive behaviors (e.g., someone always betting on their team)
4. Rivalries between members

Format your response as JSON:
{
  "trends": [
    {
      "type": "argument|joke|behavior|rivalry",
      "description": "Brief description",
      "participants": ["name1", "name2"],
      "frequency": "high|medium|low"
    }
  ]
}`;

        try {
            const response = await generateText(prompt);
            const analysis = JSON.parse(response);
            
            // Update detected trends
            this.state.detectedTrends = analysis.trends.map((trend: any) => ({
                type: trend.type,
                description: trend.description,
                participants: trend.participants,
                frequency: trend.frequency === 'high' ? 10 : trend.frequency === 'medium' ? 5 : 1,
                lastOccurrence: Date.now()
            }));
        } catch (error) {
            console.error('Error analyzing chat trends:', error);
        }
    }

    /**
     * Generate weekly superlatives for The Tribunal
     */
    async generateWeeklySuperlatives(weekNumber: number): Promise<TribunalSuperlative[]> {
        const recentMessages = this.state.chatHistory.slice(-300);
        
        const prompt = `Based on this week's group chat history, generate 5 superlative categories that the group can vote on and bet on:

${recentMessages.map(m => `${m.senderName}: ${m.content}`).join('\n')}

Generate creative superlatives like:
- "Most Delusional Take"
- "Best Joke"
- "Biggest L of the Week"
- "Most Out-of-Pocket Comment"

For each superlative, suggest 3-4 nominees with evidence from the chat.

Format as JSON:
{
  "superlatives": [
    {
      "title": "Superlative Title",
      "description": "What makes someone win this",
      "nominees": [
        {
          "playerName": "Name",
          "evidence": "Quote from chat that supports this nomination"
        }
      ]
    }
  ]
}`;

        try {
            const response = await generateText(prompt);
            const data = JSON.parse(response);
            
            const superlatives: TribunalSuperlative[] = data.superlatives.map((s: any, index: number) => {
                // Calculate odds based on number of nominees (more competitive = closer odds)
                const baseOdds = [150, 200, 250, 300];
                
                return {
                    id: `tribunal_${weekNumber}_${index}`,
                    title: s.title,
                    description: s.description,
                    nominees: s.nominees.map((n: any, nIndex: number) => ({
                        playerId: n.playerName.toLowerCase().replace(/\s/g, '_'),
                        playerName: n.playerName,
                        odds: baseOdds[nIndex] || 400,
                        evidence: [n.evidence]
                    })),
                    votes: {},
                    votingClosesAt: this.getSundayEndOfWeek(),
                    isResolved: false
                };
            });

            this.state.weeklySuperlatives = superlatives;
            return superlatives;
        } catch (error) {
            console.error('Error generating superlatives:', error);
            return [];
        }
    }

    /**
     * Generate betting lines based on trends
     */
    async generateBettingLines(weekNumber: number): Promise<BettingLine[]> {
        const trends = this.state.detectedTrends;
        
        if (trends.length === 0) {
            await this.analyzeChatTrends();
        }

        const prompt = `Based on these detected trends in the group chat, generate 3-5 interesting betting propositions:

${trends.map(t => `- ${t.type}: ${t.description} (${t.participants.join(', ')})`).join('\n')}

Create prop bets like:
- "Colin mentions his girlfriend at least 5 times this week" (+150)
- "Eric defends the Cowboys despite another loss" (-110)
- "Elie claims to be 'the main character' again" (+200)

Format as JSON:
{
  "lines": [
    {
      "description": "The bet proposition",
      "odds": 150 (American odds format)
    }
  ]
}`;

        try {
            const response = await generateText(prompt);
            const data = JSON.parse(response);
            
            const lines: BettingLine[] = data.lines.map((line: any, index: number) => ({
                id: `line_${weekNumber}_${index}`,
                type: 'prop' as const,
                description: line.description,
                odds: line.odds,
                isResolved: false,
                participants: [],
                wagers: {},
                createdAt: Date.now()
            }));

            this.state.generatedLines.push(...lines);
            return lines;
        } catch (error) {
            console.error('Error generating betting lines:', error);
            return [];
        }
    }

    /**
     * Calculate American odds based on probability
     * @param probability - Win probability (0.0 to 1.0)
     * @returns American odds (e.g., +150, -110)
     */
    calculateAmericanOdds(probability: number): number {
        if (probability >= 0.5) {
            // Favorite (negative odds)
            return Math.round(-100 * (probability / (1 - probability)));
        } else {
            // Underdog (positive odds)
            return Math.round(100 * ((1 - probability) / probability));
        }
    }

    /**
     * Judge the outcome of a bet based on chat evidence
     */
    async judgeBetOutcome(betId: string, evidence: ChatMessage[]): Promise<boolean> {
        const bet = this.state.generatedLines.find(b => b.id === betId);
        if (!bet) {
            throw new Error('Bet not found');
        }

        const prompt = `Judge whether this bet outcome is TRUE or FALSE based on the evidence:

Bet: ${bet.description}

Evidence from chat:
${evidence.map(m => `${m.senderName}: ${m.content}`).join('\n')}

Respond with only "TRUE" or "FALSE" and a brief explanation.`;

        try {
            const response = await generateText(prompt);
            const outcome = response.toLowerCase().includes('true');
            
            // Mark bet as resolved
            bet.isResolved = true;
            bet.outcome = outcome;
            bet.resolvedAt = Date.now();
            bet.evidence = evidence.map(m => m.id);
            
            return outcome;
        } catch (error) {
            console.error('Error judging bet outcome:', error);
            return false;
        }
    }

    /**
     * Get the end of Sunday for this week
     */
    private getSundayEndOfWeek(): number {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        
        const sunday = new Date(now);
        sunday.setDate(sunday.getDate() + daysUntilSunday);
        sunday.setHours(23, 59, 59, 999);
        
        return sunday.getTime();
    }

    /**
     * Get current state
     */
    getState(): OverseerState {
        return this.state;
    }

    /**
     * Process a Town Hall suggestion
     */
    async processSuggestion(suggestion: TownHallSuggestion): Promise<'approved' | 'rejected'> {
        const prompt = `Evaluate this betting suggestion from a player:

Suggestion: ${suggestion.suggestion}
Type: ${suggestion.betType}
Upvotes: ${suggestion.upvotes.length}

Should this be approved as a bet? Consider:
1. Is it interesting/entertaining?
2. Is it measurable/verifiable?
3. Does it fit the group's vibe?

Respond with "APPROVE" or "REJECT" and a brief reason.`;

        try {
            const response = await generateText(prompt);
            return response.toLowerCase().includes('approve') ? 'approved' : 'rejected';
        } catch (error) {
            console.error('Error processing suggestion:', error);
            return 'rejected';
        }
    }

    /**
     * Reset for new week
     */
    resetForNewWeek(): void {
        this.state.weeklySuperlatives = [];
        // Keep chat history and trends for continuity
    }
}

export const overseerService = new OverseerService();
