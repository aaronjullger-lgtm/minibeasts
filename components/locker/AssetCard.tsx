import React from 'react';
import { Mono, Header, Label } from '../ui/Typography';

interface AssetCardProps {
  title: string;
  description: string;
  price: number;
  onPurchase: () => void;
  disabled?: boolean;
  canAfford?: boolean;
}

/**
 * AssetCard - Clean, emoji-free inventory item (Tactical Luxury Edition)
 * Layout: [Icon] [Title + Description] [Price]
 * Footer: Clickable action bar for purchase
 */
export const AssetCard: React.FC<AssetCardProps> = ({
  title,
  description,
  price,
  onPurchase,
  disabled = false,
  canAfford = true,
}) => {
  return (
    <div className="bg-tactical-panel border border-tactical-border rounded-lg overflow-hidden">
      {/* Main Card Content */}
      <div className="flex items-center gap-4 p-4">
        {/* Left: 48x48px Icon Placeholder */}
        <div className="w-12 h-12 flex-shrink-0 bg-tactical-border flex items-center justify-center rounded">
          {/* Simple Box Icon (SVG) */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-text"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>

        {/* Middle: Title + Description */}
        <div className="flex-grow min-w-0">
          <Header className="mb-1">{title}</Header>
          <p className="text-sm text-muted-text truncate">{description}</p>
        </div>

        {/* Right: Price */}
        <div className="flex-shrink-0 text-right">
          <Label>COST</Label>
          <div className="mt-1">
            <Mono className="text-xl">{price.toLocaleString()}</Mono>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <button
        onClick={onPurchase}
        disabled={disabled || !canAfford}
        className={`w-full border-t border-tactical-border py-3 px-4 text-center transition-colors ${
          disabled || !canAfford
            ? 'bg-tactical-panel text-muted-text cursor-not-allowed'
            : 'bg-tactical-panel text-paper-white hover:bg-[#222] active:bg-[#2a2a2a] cursor-pointer'
        }`}
      >
        <Label className={disabled || !canAfford ? 'text-muted-text' : 'text-paper-white'}>
          {disabled ? 'UNAVAILABLE' : !canAfford ? 'INSUFFICIENT FUNDS' : `ACQUIRE // ${price.toLocaleString()} GRIT`}
        </Label>
      </button>
    </div>
  );
};
