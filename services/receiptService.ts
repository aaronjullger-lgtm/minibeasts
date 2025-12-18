/**
 * Receipt Service
 * 
 * Handles shareable image generation for Mini Beasts social features.
 * Uses html-to-image to convert receipt components into images for sharing in iMessage.
 */

import { toPng } from 'html-to-image';

export interface ReceiptGenerationOptions {
  quality?: number; // 0-1, default 0.95
  pixelRatio?: number; // default 2 for retina displays
  backgroundColor?: string; // default transparent
  width?: number; // Optional fixed width
  height?: number; // Optional fixed height
}

// Constants
const FRAUD_ALERT_INSULTS = [
  'User Delusion',
  'Bad Ball Knowledge',
  'Insufficient Grit',
  'Poor Decision Making',
  'Questionable Judgment',
  'Terminal Optimism',
  'Chronic Cope',
  'Delusional Confidence',
  'Fraudulent Activity',
  'Betting Against Reality',
];

class ReceiptService {
  private readonly DEFAULT_QUALITY = 0.95;
  private readonly DEFAULT_PIXEL_RATIO = 2;
  
  /**
   * Generate a PNG image from a React component reference
   * Optimized for iMessage previews with clean borders and readable text
   */
  async generateImage(
    element: HTMLElement,
    options: ReceiptGenerationOptions = {}
  ): Promise<string> {
    const {
      quality = this.DEFAULT_QUALITY,
      pixelRatio = this.DEFAULT_PIXEL_RATIO,
      backgroundColor = '#050A14', // board-navy background
      width,
      height,
    } = options;

    try {
      const dataUrl = await toPng(element, {
        quality,
        pixelRatio,
        backgroundColor,
        width,
        height,
        cacheBust: true,
        style: {
          // Ensure fonts and styles are fully loaded
          fontDisplay: 'swap',
        },
      });

      return dataUrl;
    } catch (error) {
      console.error('Failed to generate receipt image:', error);
      throw new Error('Image generation failed');
    }
  }

  /**
   * Generate image and copy to clipboard
   * Primary method for sharing receipts to iMessage
   */
  async copyToClipboard(
    element: HTMLElement,
    options: ReceiptGenerationOptions = {}
  ): Promise<void> {
    try {
      const dataUrl = await this.generateImage(element, options);
      
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Copy to clipboard using modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.write) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw new Error('Clipboard copy failed');
    }
  }

  /**
   * Download image as PNG file
   * Alternative to clipboard for platforms that don't support it
   */
  async downloadImage(
    element: HTMLElement,
    filename: string = 'mini-beasts-receipt.png',
    options: ReceiptGenerationOptions = {}
  ): Promise<void> {
    try {
      const dataUrl = await this.generateImage(element, options);
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download image:', error);
      throw new Error('Image download failed');
    }
  }

  /**
   * Generate a watermarked footer for all receipts
   * Tasteful "MINI BEASTS" branding at the bottom
   */
  createWatermark(): string {
    return 'MINI BEASTS';
  }

  /**
   * Format odds for display (American odds)
   */
  formatOdds(odds: number): string {
    if (odds > 0) {
      return `+${odds}`;
    }
    return odds.toString();
  }

  /**
   * Calculate potential payout from wager and odds
   */
  calculatePayout(wager: number, odds: number): number {
    if (odds > 0) {
      // Positive odds: (wager * odds) / 100 + wager
      return (wager * odds) / 100 + wager;
    } else {
      // Negative odds: (wager * 100) / Math.abs(odds) + wager
      return (wager * 100) / Math.abs(odds) + wager;
    }
  }

  /**
   * Format grit amount with commas
   */
  formatGrit(amount: number): string {
    return amount.toLocaleString('en-US');
  }

  /**
   * Get random insult for Fraud Alert
   */
  getRandomInsult(): string {
    return FRAUD_ALERT_INSULTS[Math.floor(Math.random() * FRAUD_ALERT_INSULTS.length)];
  }
}

export const receiptService = new ReceiptService();
