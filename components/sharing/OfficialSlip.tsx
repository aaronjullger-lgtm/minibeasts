import React, { useRef, useState } from 'react';
import { receiptService } from '../../services/receiptService';

interface OfficialSlipProps {
  // Bet details
  betId: string;
  teamLogo?: string; // Team initial or logo
  teamName: string;
  odds: number;
  wager: number;
  potentialPayout: number;
  
  // Status
  status: 'pending' | 'won' | 'lost';
  
  // Notes (the comedy section)
  notes?: string;
  
  // User info
  playerName: string;
  timestamp?: Date;
  
  // Callback for share action
  onShare?: () => void;
}

/**
 * OfficialSlip - The "Proof" Receipt
 * 
 * Looks like a digital Apple Wallet pass or sleek sports ticket.
 * Used when someone makes a bet to act as proof.
 */
export const OfficialSlip: React.FC<OfficialSlipProps> = ({
  betId,
  teamLogo,
  teamName,
  odds,
  wager,
  potentialPayout,
  status,
  notes,
  playerName,
  timestamp = new Date(),
  onShare,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!receiptRef.current || isGenerating) return;

    setIsGenerating(true);
    try {
      await receiptService.copyToClipboard(receiptRef.current);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.();
    } catch (error) {
      console.error('Failed to copy receipt:', error);
      // Fallback to download
      try {
        await receiptService.downloadImage(
          receiptRef.current,
          `official-slip-${betId}.png`
        );
        onShare?.();
      } catch (downloadError) {
        console.error('Failed to download receipt:', downloadError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative">
      {/* The actual receipt component that will be captured */}
      <div
        ref={receiptRef}
        className="w-[400px] bg-gradient-to-br from-board-surface to-board-navy border border-board-highlight/30 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header - Apple Wallet style */}
        <div className="bg-gradient-to-r from-board-highlight to-board-surface px-6 py-4 border-b border-board-highlight/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Team Logo/Initial */}
              {teamLogo ? (
                <div className="text-3xl font-bold">{teamLogo}</div>
              ) : (
                <div className="w-12 h-12 bg-board-gold/20 rounded-lg flex items-center justify-center">
                  <span className="text-board-gold text-xl font-bold">
                    {teamName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-board-text font-bold text-lg">{teamName}</h3>
                <p className="text-board-text/60 text-sm">Official Slip</p>
              </div>
            </div>
            
            {/* Odds Badge */}
            <div className="bg-board-gold/10 border border-board-gold/30 rounded-lg px-3 py-1">
              <span className="text-board-gold font-mono text-xl font-bold">
                {receiptService.formatOdds(odds)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Wager & Payout */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-board-text/60 text-sm font-mono">WAGER</span>
              <span className="text-board-text font-mono text-lg font-bold">
                {receiptService.formatGrit(wager)} GRIT
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-board-text/60 text-sm font-mono">TO WIN</span>
              <span className="text-board-gold font-mono text-lg font-bold">
                {receiptService.formatGrit(potentialPayout - wager)} GRIT
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-board-highlight/30 border-dashed"></div>

          {/* Notes Section (The Comedy Happens Here) */}
          {notes && (
            <div className="bg-board-navy/50 rounded-lg p-4 border border-board-highlight/20">
              <p className="text-board-text/40 text-xs font-mono uppercase mb-1">
                Notes
              </p>
              <p className="text-board-text font-mono text-sm italic">
                "{notes}"
              </p>
            </div>
          )}

          {/* Bet Details */}
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between text-board-text/40">
              <span>BET ID</span>
              <span className="font-bold">{betId.slice(0, 12).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-board-text/40">
              <span>PLACED BY</span>
              <span className="font-bold uppercase">{playerName}</span>
            </div>
            <div className="flex justify-between text-board-text/40">
              <span>DATE</span>
              <span className="font-bold">
                {timestamp.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Status Overlay - "CASHED" stamp if won */}
        {status === 'won' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="transform rotate-[-15deg]">
              <div className="border-4 border-board-gold rounded-lg px-8 py-4 bg-board-navy/90">
                <span className="text-board-gold font-bold text-5xl tracking-wider">
                  CASHED
                </span>
              </div>
            </div>
          </div>
        )}

        {status === 'lost' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="transform rotate-[-15deg]">
              <div className="border-4 border-board-red rounded-lg px-8 py-4 bg-board-navy/90">
                <span className="text-board-red font-bold text-5xl tracking-wider">
                  VOID
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Watermark Footer */}
        <div className="bg-board-navy/30 px-6 py-3 border-t border-board-highlight/20">
          <p className="text-center text-board-text/20 text-xs font-mono tracking-widest">
            {receiptService.createWatermark()}
          </p>
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={handleCopyToClipboard}
        disabled={isGenerating}
        className="mt-4 w-full bg-board-gold hover:bg-board-gold/90 text-board-navy font-bold py-3 rounded-lg transition-all disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : copied ? 'Copied!' : 'Copy to Clipboard'}
      </button>
    </div>
  );
};
