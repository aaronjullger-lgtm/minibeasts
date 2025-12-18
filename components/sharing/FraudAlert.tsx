import React, { useRef, useState } from 'react';
import { receiptService } from '../../services/receiptService';

interface FraudAlertProps {
  // Target info
  playerName: string;
  teamName: string; // The team they bet on (the "merchant")
  
  // Bet details
  lostAmount: number; // How much grit they lost
  betDescription?: string;
  
  // Optional custom reason
  customReason?: string;
  
  // Callback for share action
  onShare?: () => void;
}

/**
 * FraudAlert - The Roast Card
 * 
 * Mimics a Bank/Credit Card "Suspicious Activity" notification.
 * Used to roast a friend who lost a bad bet.
 */
export const FraudAlert: React.FC<FraudAlertProps> = ({
  playerName,
  teamName,
  lostAmount,
  betDescription,
  customReason,
  onShare,
}) => {
  const alertRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get random insult if no custom reason provided
  const reason = customReason || receiptService.getRandomInsult();

  const handleCopyToClipboard = async () => {
    if (!alertRef.current || isGenerating) return;

    setIsGenerating(true);
    try {
      await receiptService.copyToClipboard(alertRef.current);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.();
    } catch (error) {
      console.error('Failed to copy alert:', error);
      // Fallback to download
      try {
        await receiptService.downloadImage(
          alertRef.current,
          `fraud-alert-${playerName.toLowerCase().replace(/\s+/g, '-')}.png`
        );
        onShare?.();
      } catch (downloadError) {
        console.error('Failed to download alert:', downloadError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const timestamp = new Date();

  return (
    <div className="relative">
      {/* The actual alert component that will be captured */}
      <div
        ref={alertRef}
        className="w-[400px] bg-gradient-to-br from-board-red/10 to-board-navy border-2 border-board-red/50 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Warning Header */}
        <div className="bg-board-red px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg tracking-tight">
              SECURITY ALERT
            </h3>
            <p className="text-white/80 text-sm">Suspicious Activity Detected</p>
          </div>
        </div>

        {/* Main Alert Content */}
        <div className="px-6 py-6 space-y-5">
          {/* Transaction Declined Banner */}
          <div className="bg-gradient-to-r from-board-red/20 to-board-red/5 border border-board-red/30 rounded-lg px-4 py-3">
            <p className="text-board-red font-bold text-2xl tracking-wide text-center">
              TRANSACTION DECLINED
            </p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-board-text/60 text-sm font-mono uppercase">
                Account Holder
              </span>
              <span className="text-board-text font-mono text-base font-bold uppercase text-right">
                {playerName}
              </span>
            </div>

            <div className="border-t border-board-highlight/20 pt-3">
              <div className="flex justify-between items-start">
                <span className="text-board-text/60 text-sm font-mono uppercase">
                  Merchant
                </span>
                <span className="text-board-text font-mono text-base font-bold text-right">
                  {teamName}
                </span>
              </div>
            </div>

            <div className="border-t border-board-highlight/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-board-text/60 text-sm font-mono uppercase">
                  Amount
                </span>
                <span className="text-board-red font-mono text-xl font-bold">
                  -{receiptService.formatGrit(lostAmount)} GRIT
                </span>
              </div>
            </div>

            {betDescription && (
              <div className="border-t border-board-highlight/20 pt-3">
                <p className="text-board-text/60 text-xs font-mono uppercase mb-2">
                  Transaction Details
                </p>
                <p className="text-board-text/80 text-sm font-mono">
                  {betDescription}
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-board-red/20 border-dashed"></div>

          {/* Decline Reason - The Roast */}
          <div className="bg-board-navy/80 border border-board-red/20 rounded-lg p-4">
            <p className="text-board-red/60 text-xs font-mono uppercase mb-2">
              Decline Reason
            </p>
            <p className="text-board-red font-mono text-lg font-bold tracking-wide">
              {reason}
            </p>
          </div>

          {/* Warning Message */}
          <div className="bg-board-red/5 rounded-lg px-4 py-3 border border-board-red/20">
            <p className="text-board-text/60 text-xs font-mono text-center">
              This account has been flagged for questionable betting behavior.
              <br />
              Please review your ball knowledge before attempting future wagers.
            </p>
          </div>

          {/* Timestamp */}
          <div className="pt-2">
            <div className="flex justify-between text-board-text/40 text-xs font-mono">
              <span>Alert ID</span>
              <span className="font-bold">
                FA-{Date.now().toString().slice(-8)}
              </span>
            </div>
            <div className="flex justify-between text-board-text/40 text-xs font-mono mt-1">
              <span>Date & Time</span>
              <span className="font-bold">
                {timestamp.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Watermark Footer */}
        <div className="bg-board-red/10 px-6 py-3 border-t border-board-red/20">
          <p className="text-center text-board-text/20 text-xs font-mono tracking-widest">
            {receiptService.createWatermark()} SECURITY
          </p>
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={handleCopyToClipboard}
        disabled={isGenerating}
        className="mt-4 w-full bg-board-red hover:bg-board-red/90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : copied ? 'Copied!' : 'Copy to Clipboard'}
      </button>
    </div>
  );
};
