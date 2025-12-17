/**
 * The Wiretap Service
 * Manages AI ingestion of chat logs, "Snitch Wire" user reporting,
 * and dynamic odds setting for future Shadow Lock bets
 */

import { PlayerState } from '../types';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: Date;
  imageUrl?: string; // For screenshot-based messages
  ocrText?: string; // Extracted text from images via OCR
}

export interface SnitchReport {
  id: string;
  reporterId: string;
  reporterName: string;
  messageId: string;
  message: ChatMessage;
  category: 'sports' | 'delusion' | 'romance' | 'social' | 'behavior';
  suggestedDescription: string;
  suggestedOdds?: number;
  status: 'pending' | 'approved' | 'rejected' | 'converted_to_bet';
  submittedAt: Date;
  investigatedAt?: Date;
  findersFeePaid?: number;
}

export interface WiretapActivityMetrics {
  userId: string;
  username: string;
  messageCount: number;
  controversyScore: number; // 0-100, based on keyword analysis
  isHeatingUp: boolean; // True if in top 3 most active/controversial
  recentMessages: ChatMessage[];
}

export interface AIProposedBet {
  id: string;
  targetUserId: string;
  targetUsername: string;
  category: 'sports' | 'delusion' | 'romance' | 'social' | 'behavior';
  triggerPhrase: string;
  description: string;
  odds: number; // American-style odds (e.g., +150, -110)
  confidence: number; // 0-100, AI confidence in the bet quality
  evidenceMessages: ChatMessage[];
  sourceReportId?: string; // If this came from a Snitch Report
  createdAt: Date;
  status: 'pending_commish_approval' | 'approved' | 'rejected' | 'posted_to_board';
}

// Rate limiting for Snitch Reports: 3 per week per user
const SNITCH_LIMIT_PER_WEEK = 3;
const FINDERS_FEE_BASE = 50; // Base Grit reward for approved snitches
const FINDERS_FEE_MULTIPLIER = 1.5; // Multiplier if bet gets posted to board

class WiretapService {
  private snitchReports: SnitchReport[] = [];
  private chatMessages: ChatMessage[] = [];
  private proposedBets: AIProposedBet[] = [];
  private activityMetrics: Map<string, WiretapActivityMetrics> = new Map();
  private userSnitchCounts: Map<string, { count: number; weekStart: Date }> = new Map();

  /**
   * Ingest new chat message for AI analysis
   */
  ingestChatMessage(message: ChatMessage): void {
    this.chatMessages.push(message);
    
    // Update activity metrics
    this.updateActivityMetrics(message);
    
    // Trigger AI analysis for potential props
    this.analyzeMessageForProps(message);
  }

  /**
   * Process image with OCR to extract text
   */
  async processImageMessage(imageUrl: string, userId: string, username: string): Promise<ChatMessage> {
    // In a real implementation, this would call an OCR service
    // For now, we'll create a placeholder
    const ocrText = await this.performOCR(imageUrl);
    
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      username,
      text: '', // Original text is empty for image messages
      imageUrl,
      ocrText,
      timestamp: new Date(),
    };
    
    this.ingestChatMessage(message);
    return message;
  }

  /**
   * Placeholder OCR function (would integrate with real OCR service)
   */
  private async performOCR(imageUrl: string): Promise<string> {
    // In production, integrate with Tesseract.js or Google Cloud Vision API
    // For now, return placeholder
    return '[OCR would extract text from image here]';
  }

  /**
   * Submit a Snitch Report
   */
  submitSnitchReport(
    reporterId: string,
    reporterName: string,
    message: ChatMessage,
    category: SnitchReport['category'],
    suggestedDescription: string
  ): { success: boolean; error?: string; report?: SnitchReport } {
    // Check rate limit
    const canSnitch = this.checkSnitchRateLimit(reporterId);
    if (!canSnitch) {
      return {
        success: false,
        error: `Spam Snitching detected! You can only submit ${SNITCH_LIMIT_PER_WEEK} reports per week.`,
      };
    }

    const report: SnitchReport = {
      id: `snitch_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      reporterId,
      reporterName,
      messageId: message.id,
      message,
      category,
      suggestedDescription,
      status: 'pending',
      submittedAt: new Date(),
    };

    this.snitchReports.push(report);
    this.incrementSnitchCount(reporterId);

    // Trigger AI investigation
    this.investigateSnitchReport(report.id);

    return { success: true, report };
  }

  /**
   * Check if user has exceeded snitch rate limit
   */
  private checkSnitchRateLimit(userId: string): boolean {
    const now = new Date();
    const userLimit = this.userSnitchCounts.get(userId);

    if (!userLimit) {
      return true; // First snitch of the week
    }

    // Check if we're in a new week
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    const timeSinceWeekStart = now.getTime() - userLimit.weekStart.getTime();
    
    if (timeSinceWeekStart > weekInMs) {
      // New week, reset count
      this.userSnitchCounts.set(userId, { count: 0, weekStart: now });
      return true;
    }

    return userLimit.count < SNITCH_LIMIT_PER_WEEK;
  }

  /**
   * Increment snitch count for user
   */
  private incrementSnitchCount(userId: string): void {
    const now = new Date();
    const userLimit = this.userSnitchCounts.get(userId);

    if (!userLimit) {
      this.userSnitchCounts.set(userId, { count: 1, weekStart: now });
    } else {
      userLimit.count++;
    }
  }

  /**
   * Get remaining snitch reports for user this week
   */
  getRemainingSnitchReports(userId: string): number {
    const userLimit = this.userSnitchCounts.get(userId);
    if (!userLimit) return SNITCH_LIMIT_PER_WEEK;

    const now = new Date();
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    const timeSinceWeekStart = now.getTime() - userLimit.weekStart.getTime();

    if (timeSinceWeekStart > weekInMs) {
      return SNITCH_LIMIT_PER_WEEK; // New week
    }

    return Math.max(0, SNITCH_LIMIT_PER_WEEK - userLimit.count);
  }

  /**
   * AI investigation of snitch report
   */
  private investigateSnitchReport(reportId: string): void {
    const report = this.snitchReports.find(r => r.id === reportId);
    if (!report) return;

    // Simulate AI analysis
    // In production, this would call the AI service
    setTimeout(() => {
      const isQuality = Math.random() > 0.3; // 70% approval rate
      
      if (isQuality) {
        report.status = 'approved';
        report.investigatedAt = new Date();
        
        // Create proposed bet from report
        const proposedBet = this.createProposedBetFromReport(report);
        this.proposedBets.push(proposedBet);
      } else {
        report.status = 'rejected';
        report.investigatedAt = new Date();
      }
    }, 2000); // 2-second "investigation" delay
  }

  /**
   * Create AI-proposed bet from snitch report
   */
  private createProposedBetFromReport(report: SnitchReport): AIProposedBet {
    // AI would set odds based on frequency analysis
    const baseOdds = this.calculateOddsFromFrequency(report.message.userId, report.category);
    
    return {
      id: `proposed_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      targetUserId: report.message.userId,
      targetUsername: report.message.username,
      category: report.category,
      triggerPhrase: report.suggestedDescription,
      description: `Will ${report.message.username} ${report.suggestedDescription}?`,
      odds: baseOdds,
      confidence: 75, // AI confidence score
      evidenceMessages: [report.message],
      sourceReportId: report.id,
      createdAt: new Date(),
      status: 'pending_commish_approval',
    };
  }

  /**
   * Calculate odds based on behavior frequency in surveillance logs
   */
  private calculateOddsFromFrequency(userId: string, category: string): number {
    const userMessages = this.chatMessages.filter(m => m.userId === userId);
    const relevantMessages = userMessages.filter(m => 
      this.messageMatchesCategory(m, category)
    );

    const frequency = userMessages.length > 0 
      ? relevantMessages.length / userMessages.length 
      : 0;

    // Convert frequency to American odds
    // High frequency = low odds (more likely to happen)
    // Low frequency = high odds (less likely to happen)
    if (frequency > 0.5) {
      return Math.floor(-110 - (frequency - 0.5) * 400); // Negative odds for favorites
    } else {
      return Math.floor(100 + (1 - frequency * 2) * 300); // Positive odds for underdogs
    }
  }

  /**
   * Check if message matches category based on keywords
   */
  private messageMatchesCategory(message: ChatMessage, category: string): boolean {
    const text = (message.text + ' ' + (message.ocrText || '')).toLowerCase();
    
    const keywords: Record<string, string[]> = {
      sports: ['ravens', 'nfl', 'game', 'player', 'team', 'score', 'touchdown'],
      delusion: ['delusional', 'cope', 'hopium', 'wrong', 'take'],
      romance: ['girlfriend', 'wife', 'date', 'love', 'relationship'],
      social: ['group', 'hangout', 'meet', 'party', 'gathering'],
      behavior: ['mention', 'say', 'talk about', 'bring up'],
    };

    const categoryKeywords = keywords[category] || [];
    return categoryKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Update activity metrics for heat map
   */
  private updateActivityMetrics(message: ChatMessage): void {
    let metrics = this.activityMetrics.get(message.userId);
    
    if (!metrics) {
      metrics = {
        userId: message.userId,
        username: message.username,
        messageCount: 0,
        controversyScore: 0,
        isHeatingUp: false,
        recentMessages: [],
      };
      this.activityMetrics.set(message.userId, metrics);
    }

    metrics.messageCount++;
    metrics.recentMessages.push(message);
    
    // Keep only last 20 messages
    if (metrics.recentMessages.length > 20) {
      metrics.recentMessages = metrics.recentMessages.slice(-20);
    }

    // Calculate controversy score based on keywords
    const controversialKeywords = ['wrong', 'delusional', 'cope', 'bad take', 'disagree'];
    const messageText = message.text.toLowerCase();
    const controversyBoost = controversialKeywords.filter(kw => messageText.includes(kw)).length * 10;
    metrics.controversyScore = Math.min(100, metrics.controversyScore + controversyBoost);

    // Decay controversy over time
    metrics.controversyScore = Math.max(0, metrics.controversyScore - 1);

    // Determine if user is "heating up"
    this.updateHeatMap();
  }

  /**
   * Update heat map to identify top 3 most active/controversial users
   */
  private updateHeatMap(): void {
    const allMetrics = Array.from(this.activityMetrics.values());
    
    // Sort by combined activity + controversy score
    allMetrics.sort((a, b) => {
      const scoreA = a.messageCount + a.controversyScore;
      const scoreB = b.messageCount + b.controversyScore;
      return scoreB - scoreA;
    });

    // Mark top 3 as "heating up"
    allMetrics.forEach((metrics, index) => {
      metrics.isHeatingUp = index < 3;
    });
  }

  /**
   * Analyze message for automatic prop generation
   */
  private analyzeMessageForProps(message: ChatMessage): void {
    // AI would analyze patterns here
    // For demo, we'll create props based on simple heuristics
    const text = message.text.toLowerCase();
    
    // Example: detect "Ravens" mentions
    if (text.includes('ravens')) {
      // Check if we should create a prop
      const existingRavensProp = this.proposedBets.find(
        bet => bet.targetUserId === message.userId && 
               bet.triggerPhrase.toLowerCase().includes('ravens')
      );
      
      if (!existingRavensProp && Math.random() > 0.95) {
        // 5% chance to create a new Ravens prop
        const proposedBet: AIProposedBet = {
          id: `proposed_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          targetUserId: message.userId,
          targetUsername: message.username,
          category: 'sports',
          triggerPhrase: 'mention the Ravens',
          description: `Will ${message.username} mention the Ravens 3x today?`,
          odds: this.calculateOddsFromFrequency(message.userId, 'sports'),
          confidence: 65,
          evidenceMessages: [message],
          createdAt: new Date(),
          status: 'pending_commish_approval',
        };
        
        this.proposedBets.push(proposedBet);
      }
    }
  }

  /**
   * Pay Finder's Fee for approved snitch reports
   */
  payFindersFee(reportId: string, player: PlayerState): number {
    const report = this.snitchReports.find(r => r.id === reportId);
    if (!report || report.reporterId !== player.id) return 0;

    let fee = 0;
    
    if (report.status === 'approved') {
      fee = FINDERS_FEE_BASE;
    } else if (report.status === 'converted_to_bet') {
      fee = Math.floor(FINDERS_FEE_BASE * FINDERS_FEE_MULTIPLIER);
    }

    if (fee > 0 && !report.findersFeePaid) {
      report.findersFeePaid = fee;
      player.grit += fee;
    }

    return fee;
  }

  /**
   * Get activity metrics for all users (for heat map display)
   */
  getActivityMetrics(): WiretapActivityMetrics[] {
    return Array.from(this.activityMetrics.values())
      .sort((a, b) => (b.messageCount + b.controversyScore) - (a.messageCount + a.controversyScore));
  }

  /**
   * Get pending snitch reports
   */
  getPendingSnitchReports(): SnitchReport[] {
    return this.snitchReports.filter(r => r.status === 'pending');
  }

  /**
   * Get user's snitch reports
   */
  getUserSnitchReports(userId: string): SnitchReport[] {
    return this.snitchReports.filter(r => r.reporterId === userId);
  }

  /**
   * Get AI-proposed bets pending Commish approval
   */
  getProposedBets(status?: AIProposedBet['status']): AIProposedBet[] {
    if (status) {
      return this.proposedBets.filter(b => b.status === status);
    }
    return this.proposedBets;
  }

  /**
   * Get recent chat messages for live feed display
   */
  getRecentMessages(limit: number = 50): ChatMessage[] {
    return this.chatMessages.slice(-limit);
  }

  /**
   * Approve proposed bet and convert to Shadow Lock
   */
  approveProposedBet(betId: string): AIProposedBet | null {
    const bet = this.proposedBets.find(b => b.id === betId);
    if (!bet) return null;

    bet.status = 'approved';
    
    // Mark source snitch report as converted
    if (bet.sourceReportId) {
      const report = this.snitchReports.find(r => r.id === bet.sourceReportId);
      if (report) {
        report.status = 'converted_to_bet';
      }
    }

    return bet;
  }

  /**
   * Post approved bet to The Board
   */
  postBetToBoard(betId: string): void {
    const bet = this.proposedBets.find(b => b.id === betId);
    if (!bet) return;

    bet.status = 'posted_to_board';
    
    // This would integrate with bettingService to create actual Shadow Lock
    // For now, we just update the status
  }
}

export const wiretapService = new WiretapService();
