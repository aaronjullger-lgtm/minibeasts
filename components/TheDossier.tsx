import React from 'react';
import { OverseerPlayerState } from '../types';

interface TheDossierProps {
  player: OverseerPlayerState;
  onClose?: () => void;
}

const StatItem: React.FC<{ label: string; value: string | number; tone?: 'danger' | 'muted' }> = ({ label, value, tone }) => {
  const toneClasses =
    tone === 'danger'
      ? 'text-board-red border-board-red/60'
      : 'text-board-off-white border-board-muted-blue/40';

  return (
    <div className={`border p-3 rounded-sm bg-black/30 ${toneClasses}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-board-off-white/60">{label}</p>
      <p className="text-2xl font-board-grit mt-1">{value}</p>
    </div>
  );
};

export const TheDossier: React.FC<TheDossierProps> = ({ player, onClose }) => {
  const corruptionIndex = player?.ambushBets?.length ?? 0;
  const gagCount = player?.gulagState?.rapSheet?.filter((entry) =>
    entry.toLowerCase().includes('gag')
  ).length ?? 0;
  const rapSheetEntries = player?.gulagState?.rapSheet ?? [];
  const bookingNumber = player?.id || '00000';
  const avatarLabel = player?.name?.slice(0, 1)?.toUpperCase() || '?';

  return (
    <div className="relative max-w-5xl mx-auto bg-board-navy border border-board-muted-blue/50 rounded-md overflow-hidden shadow-2xl">
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, rgba(255,51,51,0.15) 0, rgba(255,51,51,0.15) 12px, transparent 12px, transparent 24px)',
        }}
      />

      <div className="bg-gradient-to-r from-board-navy to-[#0d1628] px-6 py-4 border-b border-board-red/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-[11px] uppercase tracking-[0.28em] font-board-grit bg-board-red text-white border border-white/10 rotate-[-4deg]">
            Top Secret
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-board-off-white/50">Classified File</p>
            <h1 className="text-2xl font-board-header text-board-off-white">The Dossier</h1>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-board-off-white/70 text-sm hover:text-white transition-colors"
          >
            Close ✕
          </button>
        )}
      </div>

      <div className="p-6 lg:p-8 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,51,51,0.08),transparent_30%)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 bg-[#f4e7c3] text-board-navy shadow-inner rounded-sm overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 18px)',
              }}
            />
            <div className="p-5 space-y-4 relative">
              <div className="relative w-40 h-40 mx-auto bg-board-navy/90 border-4 border-board-red/60 shadow-lg overflow-hidden">
                <div
                  className="w-full h-full flex items-center justify-center text-5xl font-board-header text-board-off-white"
                  style={{
                    filter: 'grayscale(100%) contrast(120%) brightness(80%)',
                    backgroundColor: player?.nflTeamColor || '#0f172a',
                  }}
                >
                  {avatarLabel}
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/80 text-board-off-white text-center text-xs font-board-grit tracking-[0.25em] py-2">
                  #{bookingNumber}
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[11px] uppercase tracking-[0.28em] text-board-red font-bold">Mugshot Archive</p>
                <h2 className="text-xl font-board-header">{player?.name}</h2>
                <p className="text-sm text-board-navy/70 font-board-grit">Rank {player?.rank ?? 0} • {player?.characterId?.toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatItem label="Corruption Index" value={corruptionIndex} tone="danger" />
              <StatItem label="Gag Count" value={gagCount} />
              <StatItem label="Current Net Worth" value={`${player?.grit ?? 0} GRIT`} />
            </div>

            <div className="bg-board-navy/60 border border-board-muted-blue/60 rounded-sm p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-board-off-white/50">The Rap Sheet</p>
                  <h3 className="text-lg font-board-header text-board-off-white">History of Infractions</h3>
                </div>
                <span className="px-3 py-1 text-[11px] uppercase tracking-[0.18em] bg-board-red/20 text-board-red border border-board-red/50 rounded-sm">
                  {rapSheetEntries.length || 0} Entries
                </span>
              </div>
              {rapSheetEntries.length === 0 ? (
                <p className="text-board-off-white/60 text-sm italic">No recorded offenses... yet.</p>
              ) : (
                <ul className="space-y-2">
                  {rapSheetEntries.map((entry, idx) => (
                    <li
                      key={idx}
                      className="relative px-3 py-2 bg-white/5 border border-white/10 rounded-sm text-sm text-board-off-white/90"
                    >
                      <span className="absolute left-0 top-0 h-full w-[3px] bg-board-red/70" />
                      {entry}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-sm p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-board-off-white/50 mb-2">Current Standing</p>
                <p className="text-board-off-white/80 text-sm leading-relaxed">
                  Subject exhibits patterns of risky behavior tied to Syndicate actions. Monitor for further infractions and potential gag-order abuse.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-sm p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-board-off-white/50 mb-2">Notes</p>
                <p className="text-board-off-white/80 text-sm leading-relaxed">
                  Booking number and mugshot are logged for all tribunals. This dossier refreshes live as grit, ambush bets, and gulag records change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
