import React, { useEffect, useMemo, useRef, useState } from 'react';
import { OverseerPlayerState } from '../types';

interface GulagLockdownProps {
  player: OverseerPlayerState;
  onHailMary?: () => { won: boolean; parlay: string };
  children: React.ReactNode;
}

const HAIL_MARY_REWARD = 500;

export const GulagLockdown: React.FC<GulagLockdownProps> = ({ player, onHailMary, children }) => {
  const [result, setResult] = useState<null | 'win' | 'lose'>(null);
  const [parlay, setParlay] = useState<string>('');
  const audioRef = useRef<AudioBufferSourceNode | null>(null);
  const isLocked = player.grit <= 0 || player.gulagState?.inGulag;

  const parlayPrompt = useMemo(() => {
    const templates = [
      '5-leg underdog parlay with at least two NFC East teams.',
      'Exact final score on the late Sunday Night game.',
      'Hit a same-game parlay with a defensive TD + safety.',
      'Pick three backup QBs to cover the spread on the road.',
      'Over on every first-half total in the primetime slate.',
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }, [player.id]);

  useEffect(() => {
    if (!isLocked && audioRef.current) {
      audioRef.current.stop();
      audioRef.current = null;
    }
  }, [isLocked]);

  const getAudioCtor = () => {
    if (typeof window === 'undefined') return null;
    return (window.AudioContext || (window as any).webkitAudioContext || null) as
      | typeof AudioContext
      | null;
  };

  useEffect(() => {
    if (!isLocked || typeof window === 'undefined') return;
    try {
      const AudioCtor = getAudioCtor();
      if (!AudioCtor) return;
      const ctx = new AudioCtor();
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.08;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.06;
      source.connect(gain).connect(ctx.destination);
      source.start(0);
      audioRef.current = source;
      return () => {
        source.stop();
      };
    } catch {
      // ignore audio failures in non-browser environments or when autoplay is blocked
    }
  }, [isLocked]);

  const handleHailMary = () => {
    if (!onHailMary) return;
    const outcome = onHailMary();
    setParlay(outcome.parlay);
    setResult(outcome.won ? 'win' : 'lose');
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-board-navy text-board-off-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.6\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          opacity: 0.12,
        }}
      />
      <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: 'grayscale(100%)' }} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full bg-black/70 border-2 border-board-crimson rounded-sm shadow-2xl">
          <div className="px-6 py-4 border-b border-board-crimson/60 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-board-off-white/60">Lockdown Protocol</p>
              <h2 className="text-2xl font-board-header text-board-off-white">The Gulag</h2>
            </div>
            <span className="px-3 py-1 text-[11px] uppercase tracking-[0.2em] bg-board-red/20 text-board-red border border-board-red/60 rounded-sm">
              Booking #{player.id}
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-board-navy/60 border border-board-muted-blue/60 rounded-sm p-4">
              <p className="text-sm text-board-off-white/80 leading-relaxed">
                You hit <span className="text-board-red font-bold">0 GRIT</span>. Global comms have been silenced, the board is locked, and every action is under surveillance. Your only lifeline is the Hail Mary parlay below.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-sm p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-board-off-white/60 mb-2">The Hail Mary</p>
              <p className="text-lg font-board-header text-board-off-white">{parlayPrompt}</p>
              <p className="text-sm text-board-off-white/60 mt-2">Win = +{HAIL_MARY_REWARD} Grit (Freedom). Lose = Executed (24h ban).</p>

              <button
                onClick={handleHailMary}
                className="mt-4 w-full bg-board-red hover:bg-red-600 text-white py-3 rounded-sm text-lg font-bold transition-all"
              >
                Take the Shot
              </button>

              {result && (
                <div className={`mt-3 p-3 border rounded-sm ${result === 'win' ? 'border-green-500/60 bg-green-500/10 text-green-200' : 'border-board-red/60 bg-board-red/10 text-board-red'}`}>
                  {result === 'win' ? (
                    <p className="font-board-header">Freedom granted. +{HAIL_MARY_REWARD} Grit restored.</p>
                  ) : (
                    <p className="font-board-header">Execution ordered. Social ban active for 24h.</p>
                  )}
                  <p className="text-xs mt-1 text-board-off-white/70">Parlay: {parlay}</p>
                </div>
              )}
            </div>

            <div className="bg-board-navy/60 border border-board-muted-blue/60 rounded-sm p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-board-off-white/50 mb-1">Access Locked</p>
              <p className="text-sm text-board-off-white/70">Bottom navigation and betting terminals are disabled until you clear the Gulag.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
