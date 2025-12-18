import React, { useState } from 'react';
import { ScreenShell } from './components/layout/ScreenShell';
import { TacticalCard } from './components/ui/TacticalCard';

/**
 * TacticalLuxuryDemo - Visual showcase of the new design system
 * Demonstrates the "Spectre" color palette and component library
 */
export const TacticalLuxuryDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Demo Header
  const header = (
    <div className="h-full flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-alert-orange rounded-lg flex items-center justify-center">
          <span className="text-tactical-dark font-bold text-sm">MB</span>
        </div>
        <h1 className="text-paper-white font-bold text-lg tracking-tight">MINI BEASTS</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 bg-tactical-panel border border-tactical-border rounded-lg">
          <span className="text-gold-leaf font-mono font-bold">$1,250</span>
        </div>
      </div>
    </div>
  );

  // Demo Footer
  const footer = (
    <div className="h-full flex items-center justify-around px-4">
      {['Home', 'Roster', 'Market', 'Stats'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab.toLowerCase())}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            activeTab === tab.toLowerCase()
              ? 'text-paper-white'
              : 'text-muted-text'
          }`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            activeTab === tab.toLowerCase()
              ? 'bg-alert-orange'
              : 'bg-tactical-border'
          }`}>
            <span className="text-xs font-bold">{tab[0]}</span>
          </div>
          <span className="text-xs font-medium">{tab}</span>
        </button>
      ))}
    </div>
  );

  return (
    <ScreenShell header={header} footer={footer}>
      <div className="p-4 space-y-4">
        {/* Color Palette Showcase */}
        <div>
          <h2 className="text-paper-white font-bold text-xl mb-3">Tactical Luxury Palette</h2>
          <p className="text-muted-text text-sm mb-4">
            The "Spectre" color scheme: Matte Black & Gunmetal aesthetic
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-tactical-dark border border-tactical-border rounded-lg p-4">
              <div className="w-full h-12 bg-tactical-dark rounded border border-tactical-border mb-2"></div>
              <p className="text-paper-white text-xs font-mono">#0A0A0A</p>
              <p className="text-muted-text text-xs">tactical-dark</p>
            </div>
            
            <div className="bg-tactical-dark border border-tactical-border rounded-lg p-4">
              <div className="w-full h-12 bg-tactical-panel rounded border border-tactical-border mb-2"></div>
              <p className="text-paper-white text-xs font-mono">#171717</p>
              <p className="text-muted-text text-xs">tactical-panel</p>
            </div>
            
            <div className="bg-tactical-dark border border-tactical-border rounded-lg p-4">
              <div className="w-full h-12 bg-alert-orange rounded mb-2"></div>
              <p className="text-paper-white text-xs font-mono">#F97316</p>
              <p className="text-muted-text text-xs">alert-orange</p>
            </div>
            
            <div className="bg-tactical-dark border border-tactical-border rounded-lg p-4">
              <div className="w-full h-12 bg-gold-leaf rounded mb-2"></div>
              <p className="text-paper-white text-xs font-mono">#D4AF37</p>
              <p className="text-muted-text text-xs">gold-leaf</p>
            </div>
          </div>
        </div>

        {/* TacticalCard Variants */}
        <div>
          <h2 className="text-paper-white font-bold text-xl mb-3">TacticalCard Component</h2>
          
          <div className="space-y-3">
            <TacticalCard>
              <h3 className="text-paper-white font-bold mb-2">Default Card</h3>
              <p className="text-muted-text text-sm">
                Flat, physical look with no shadows or glows. Background: tactical-panel.
              </p>
            </TacticalCard>

            <TacticalCard variant="alert">
              <h3 className="text-alert-orange font-bold mb-2">Alert Card</h3>
              <p className="text-muted-text text-sm">
                Used for critical actions - Safety Orange border accent.
              </p>
            </TacticalCard>

            <TacticalCard variant="gold">
              <h3 className="text-gold-leaf font-bold mb-2">Gold Card</h3>
              <p className="text-muted-text text-sm">
                For winning states only - Metallic gold border accent.
              </p>
            </TacticalCard>

            <TacticalCard interactive>
              <h3 className="text-paper-white font-bold mb-2">Interactive Card</h3>
              <p className="text-muted-text text-sm">
                Click to see the subtle lighten effect (active:bg-[#222])
              </p>
            </TacticalCard>
          </div>
        </div>

        {/* Typography Showcase */}
        <div>
          <h2 className="text-paper-white font-bold text-xl mb-3">Typography</h2>
          <TacticalCard>
            <div className="space-y-2">
              <div>
                <p className="text-paper-white text-xs uppercase tracking-wider mb-1">Primary Text</p>
                <p className="text-paper-white text-base">
                  Paper White (#F5F5F5) - Stark, high contrast
                </p>
              </div>
              <div>
                <p className="text-paper-white text-xs uppercase tracking-wider mb-1">Secondary Text</p>
                <p className="text-muted-text text-base">
                  Muted Text (#A3A3A3) - For secondary details
                </p>
              </div>
              <div>
                <p className="text-paper-white text-xs uppercase tracking-wider mb-1">Tabular Numbers</p>
                <p className="text-paper-white font-mono text-lg font-bold">
                  1,234.56 | 789.01 | 456.78
                </p>
                <p className="text-muted-text text-xs">
                  Perfect alignment with font-feature-settings: "tnum"
                </p>
              </div>
            </div>
          </TacticalCard>
        </div>

        {/* Design Principles */}
        <div>
          <h2 className="text-paper-white font-bold text-xl mb-3">Design Principles</h2>
          <TacticalCard>
            <ul className="space-y-2 text-muted-text text-sm">
              <li className="flex items-start gap-2">
                <span className="text-alert-orange">•</span>
                <span>No more neon glows - Flat, physical materials only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alert-orange">•</span>
                <span>No emojis - Professional, tactical aesthetic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alert-orange">•</span>
                <span>Matte Black (#0A0A0A) with subtle noise texture</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alert-orange">•</span>
                <span>Safety Orange (#F97316) used sparingly for critical actions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alert-orange">•</span>
                <span>Metallic Gold (#D4AF37) reserved for winning states</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alert-orange">•</span>
                <span>iOS rubber band effect prevented with overscroll-behavior-y: none</span>
              </li>
            </ul>
          </TacticalCard>
        </div>
      </div>
    </ScreenShell>
  );
};
