import React, { useRef, useState } from 'react';
import { receiptService } from '../../services/receiptService';

interface BeefContractProps {
  // Challenger info
  challengerId: string;
  challengerName: string;
  challengerAvatar?: string; // Initial or emoji
  
  // Opponent info (can be undefined if challenge is being proposed)
  opponentId?: string;
  opponentName?: string;
  opponentAvatar?: string;
  
  // Bet terms
  amount: number; // Grit amount
  description: string; // The challenge description
  
  // Status
  status?: 'proposed' | 'accepted' | 'completed';
  winner?: 'challenger' | 'opponent';
  
  // Callback for share action
  onShare?: () => void;
}

/**
 * BeefContract - The 1v1 Challenge Card
 * 
 * Looks like a sleek legal document or UFC "Tale of the Tape".
 * Used for 1v1 challenges. When pasted in chat, implies "Do you accept?"
 */
export const BeefContract: React.FC<BeefContractProps> = ({
  challengerId,
  challengerName,
  challengerAvatar,
  opponentId,
  opponentName = '???',
  opponentAvatar,
  amount,
  description,
  status = 'proposed',
  winner,
  onShare,
}) => {
  const contractRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!contractRef.current || isGenerating) return;

    setIsGenerating(true);
    try {
      await receiptService.copyToClipboard(contractRef.current);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.();
    } catch (error) {
      console.error('Failed to copy contract:', error);
      // Fallback to download
      try {
        await receiptService.downloadImage(
          contractRef.current,
          `beef-contract-${challengerId}-vs-${opponentId || 'open'}.png`
        );
        onShare?.();
      } catch (downloadError) {
        console.error('Failed to download contract:', downloadError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const timestamp = new Date();
  const contractId = `BC-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="relative">
      {/* The actual contract component that will be captured */}
      <div
        ref={contractRef}
        className="w-[450px] bg-gradient-to-br from-board-surface via-board-navy to-board-surface border-2 border-board-gold/30 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-board-gold/20 to-board-gold/5 px-6 py-4 border-b-2 border-board-gold/30">
          <div className="text-center">
            <h3 className="text-board-gold font-bold text-2xl tracking-wider uppercase">
              Beef Contract
            </h3>
            <p className="text-board-text/60 text-sm font-mono mt-1">
              Official 1v1 Challenge Agreement
            </p>
          </div>
        </div>

        {/* Tale of the Tape - Split Screen */}
        <div className="grid grid-cols-2 divide-x divide-board-gold/20 border-b border-board-gold/20">
          {/* Challenger Side */}
          <div className="px-6 py-5 bg-gradient-to-br from-board-highlight/30 to-transparent">
            <div className="text-center space-y-3">
              {/* Avatar */}
              <div className="flex justify-center">
                {challengerAvatar ? (
                  <div className="text-5xl">{challengerAvatar}</div>
                ) : (
                  <div className="w-16 h-16 bg-board-gold/20 rounded-full flex items-center justify-center border-2 border-board-gold/40">
                    <span className="text-board-gold text-2xl font-bold">
                      {challengerName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Name */}
              <div>
                <p className="text-board-text/40 text-xs font-mono uppercase mb-1">
                  Challenger
                </p>
                <p className="text-board-text font-bold text-lg uppercase tracking-wide">
                  {challengerName}
                </p>
              </div>

              {/* Winner Badge */}
              {status === 'completed' && winner === 'challenger' && (
                <div className="inline-block bg-board-gold/20 border border-board-gold px-3 py-1 rounded">
                  <span className="text-board-gold text-xs font-bold">WINNER</span>
                </div>
              )}
            </div>
          </div>

          {/* VS Divider in the middle */}
          <div className="absolute left-1/2 top-[120px] transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-16 h-16 bg-board-navy border-2 border-board-gold/50 rounded-full flex items-center justify-center">
              <span className="text-board-gold font-bold text-xl">VS</span>
            </div>
          </div>

          {/* Opponent Side */}
          <div className="px-6 py-5 bg-gradient-to-bl from-board-highlight/30 to-transparent">
            <div className="text-center space-y-3">
              {/* Avatar */}
              <div className="flex justify-center">
                {opponentAvatar ? (
                  <div className="text-5xl">{opponentAvatar}</div>
                ) : opponentId ? (
                  <div className="w-16 h-16 bg-board-gold/20 rounded-full flex items-center justify-center border-2 border-board-gold/40">
                    <span className="text-board-gold text-2xl font-bold">
                      {opponentName.charAt(0)}
                    </span>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-board-highlight/50 rounded-full flex items-center justify-center border-2 border-board-gold/20 border-dashed">
                    <span className="text-board-text/40 text-2xl font-bold">?</span>
                  </div>
                )}
              </div>
              
              {/* Name */}
              <div>
                <p className="text-board-text/40 text-xs font-mono uppercase mb-1">
                  Opponent
                </p>
                <p className="text-board-text font-bold text-lg uppercase tracking-wide">
                  {opponentName}
                </p>
              </div>

              {/* Winner Badge */}
              {status === 'completed' && winner === 'opponent' && (
                <div className="inline-block bg-board-gold/20 border border-board-gold px-3 py-1 rounded">
                  <span className="text-board-gold text-xs font-bold">WINNER</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The Terms */}
        <div className="px-6 py-6 space-y-4">
          {/* Stakes */}
          <div className="text-center bg-gradient-to-r from-board-gold/10 via-board-gold/5 to-board-gold/10 border border-board-gold/30 rounded-lg py-4 px-6">
            <p className="text-board-text/60 text-xs font-mono uppercase mb-2">
              Stakes
            </p>
            <p className="text-board-gold font-bold text-4xl font-mono tracking-wider">
              {receiptService.formatGrit(amount)} GRIT
            </p>
          </div>

          {/* Challenge Description */}
          <div className="bg-board-navy/50 border border-board-highlight/30 rounded-lg p-4">
            <p className="text-board-text/40 text-xs font-mono uppercase mb-2">
              Terms & Conditions
            </p>
            <p className="text-board-text text-base font-mono leading-relaxed">
              {description}
            </p>
          </div>

          {/* Contract Details */}
          <div className="space-y-1 text-xs font-mono pt-2">
            <div className="flex justify-between text-board-text/40">
              <span>CONTRACT ID</span>
              <span className="font-bold">{contractId}</span>
            </div>
            <div className="flex justify-between text-board-text/40">
              <span>STATUS</span>
              <span className="font-bold uppercase">{status}</span>
            </div>
            <div className="flex justify-between text-board-text/40">
              <span>ISSUED</span>
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

        {/* Signature Section */}
        <div className="bg-board-navy/30 px-6 py-4 border-t border-board-gold/20">
          <div className="space-y-3">
            {/* Challenger Signature */}
            <div className="flex items-center justify-between">
              <span className="text-board-text/40 text-xs font-mono">SIGNED BY</span>
              <span
                className="text-board-gold text-lg font-serif italic"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {challengerName}
              </span>
            </div>

            {/* Opponent Signature (if accepted) */}
            {status === 'accepted' && opponentId && (
              <>
                <div className="border-t border-board-highlight/20"></div>
                <div className="flex items-center justify-between">
                  <span className="text-board-text/40 text-xs font-mono">ACCEPTED BY</span>
                  <span
                    className="text-board-gold text-lg font-serif italic"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {opponentName}
                  </span>
                </div>
              </>
            )}

            {/* Pending Acceptance */}
            {status === 'proposed' && !opponentId && (
              <>
                <div className="border-t border-board-highlight/20"></div>
                <div className="text-center">
                  <p className="text-board-gold/60 text-sm font-mono italic">
                    Awaiting Acceptance...
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Watermark Footer */}
        <div className="bg-board-gold/5 px-6 py-3 border-t border-board-gold/20">
          <p className="text-center text-board-text/20 text-xs font-mono tracking-widest">
            {receiptService.createWatermark()} LEGAL
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
