import React, { useState } from 'react';
import { OfficialSlip, FraudAlert, BeefContract } from './components/sharing';

/**
 * SharingDemo - Visual demo and test for sharing components
 * 
 * Demonstrates all three sharing components:
 * - OfficialSlip (bet receipt)
 * - FraudAlert (roast card)
 * - BeefContract (1v1 challenge)
 */
export const SharingDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'slip' | 'fraud' | 'contract'>('slip');

  return (
    <div className="min-h-screen bg-board-navy p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-board-gold mb-2">
            Mini Beasts - Sharing Components
          </h1>
          <p className="text-board-text/60">
            Phase 5: Social Ammunition (Shareable Image Generator)
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('slip')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'slip'
                ? 'bg-board-gold text-board-navy'
                : 'bg-board-surface text-board-text/60 hover:text-board-text'
            }`}
          >
            Official Slip
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'fraud'
                ? 'bg-board-red text-white'
                : 'bg-board-surface text-board-text/60 hover:text-board-text'
            }`}
          >
            Fraud Alert
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'contract'
                ? 'bg-board-gold text-board-navy'
                : 'bg-board-surface text-board-text/60 hover:text-board-text'
            }`}
          >
            Beef Contract
          </button>
        </div>

        {/* Component Display */}
        <div className="flex justify-center">
          {activeTab === 'slip' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-board-text mb-4 text-center">
                  Pending Bet
                </h2>
                <OfficialSlip
                  betId="bet_12345_abc"
                  teamName="New York Jets"
                  teamLogo="✈️"
                  odds={150}
                  wager={500}
                  potentialPayout={1250}
                  status="pending"
                  notes="Betting against Seth's intuition."
                  playerName="Aaron"
                  onShare={() => console.log('Shared pending slip')}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-board-text mb-4 text-center">
                  Won Bet (CASHED)
                </h2>
                <OfficialSlip
                  betId="bet_67890_def"
                  teamName="Kansas City Chiefs"
                  teamLogo="🏈"
                  odds={-110}
                  wager={1000}
                  potentialPayout={1909}
                  status="won"
                  notes="Patrick Mahomes never loses."
                  playerName="Elie"
                  onShare={() => console.log('Shared won slip')}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-board-text mb-4 text-center">
                  Lost Bet (VOID)
                </h2>
                <OfficialSlip
                  betId="bet_11111_xyz"
                  teamName="Cleveland Browns"
                  teamLogo="🟤"
                  odds={-150}
                  wager={750}
                  potentialPayout={1250}
                  status="lost"
                  notes="Browns will turn it around this year."
                  playerName="Colin"
                  onShare={() => console.log('Shared lost slip')}
                />
              </div>
            </div>
          )}

          {activeTab === 'fraud' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-board-text mb-4 text-center">
                  Standard Fraud Alert
                </h2>
                <FraudAlert
                  playerName="Andrew"
                  teamName="The New York Jets"
                  lostAmount={500}
                  betDescription="Jets ML vs Bills (-250)"
                  onShare={() => console.log('Shared fraud alert')}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-board-text mb-4 text-center">
                  Custom Reason
                </h2>
                <FraudAlert
                  playerName="Spencer"
                  teamName="Dallas Cowboys"
                  lostAmount={1000}
                  betDescription="Cowboys to win Super Bowl (+800)"
                  customReason="Annual Cowboys Delusion"
                  onShare={() => console.log('Shared custom fraud alert')}
                />
              </div>
            </div>
          )}

          {activeTab === 'contract' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-board-text mb-4 text-center">
                  Proposed Challenge
                </h2>
                <BeefContract
                  challengerId="user_123"
                  challengerName="Craif"
                  challengerAvatar="🤓"
                  amount={1000}
                  description="First to correctly predict 5 game winners this week"
                  status="proposed"
                  onShare={() => console.log('Shared proposed contract')}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-board-text mb-4 text-center">
                  Accepted Challenge
                </h2>
                <BeefContract
                  challengerId="user_123"
                  challengerName="Pace"
                  challengerAvatar="🎯"
                  opponentId="user_456"
                  opponentName="Wyatt"
                  opponentAvatar="🦅"
                  amount={2000}
                  description="Most points scored in fantasy this week"
                  status="accepted"
                  onShare={() => console.log('Shared accepted contract')}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-board-text mb-4 text-center">
                  Completed Challenge
                </h2>
                <BeefContract
                  challengerId="user_789"
                  challengerName="Seth"
                  challengerAvatar="🧠"
                  opponentId="user_321"
                  opponentName="Aaron"
                  opponentAvatar="📚"
                  amount={500}
                  description="Better take on the Monday Night game"
                  status="completed"
                  winner="challenger"
                  onShare={() => console.log('Shared completed contract')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-2xl mx-auto bg-board-surface border border-board-highlight rounded-lg p-6">
          <h3 className="text-board-gold font-bold text-xl mb-4">
            How to Use
          </h3>
          <ul className="space-y-2 text-board-text/80 text-sm">
            <li>• Click "Copy to Clipboard" on any receipt to copy the image</li>
            <li>• Paste directly into iMessage to share with the group</li>
            <li>• Images are optimized for mobile viewing with clean borders</li>
            <li>• Each receipt type serves a different social purpose:</li>
            <ul className="ml-6 mt-2 space-y-1 text-board-text/60">
              <li>- Official Slip: Proof of bets, can add custom notes</li>
              <li>- Fraud Alert: Roast friends for bad betting decisions</li>
              <li>- Beef Contract: Issue 1v1 challenges to the group</li>
            </ul>
          </ul>
        </div>
      </div>
    </div>
  );
};
