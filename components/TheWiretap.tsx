/**
 * The Wiretap Dashboard Component
 * Live activity feed showing chat messages being processed by The Commish
 * with Heat Map showing users "heating up" and Snitch Wire interface
 */

import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import { wiretapService, ChatMessage, WiretapActivityMetrics, SnitchReport, AIProposedBet } from '../services/wiretapService';

interface TheWiretapProps {
  currentPlayer: PlayerState;
  allPlayers: PlayerState[];
  onClose: () => void;
}

export const TheWiretap: React.FC<TheWiretapProps> = ({ currentPlayer, allPlayers, onClose }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'snitch' | 'proposed'>('feed');
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [activityMetrics, setActivityMetrics] = useState<WiretapActivityMetrics[]>([]);
  const [userSnitchReports, setUserSnitchReports] = useState<SnitchReport[]>([]);
  const [proposedBets, setProposedBets] = useState<AIProposedBet[]>([]);
  const [remainingSnitches, setRemainingSnitches] = useState(3);
  const [scanningAnimation, setScanningAnimation] = useState(0);

  // Scanning animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanningAnimation(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Load data
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [currentPlayer.id]);

  const refreshData = () => {
    setRecentMessages(wiretapService.getRecentMessages(50));
    setActivityMetrics(wiretapService.getActivityMetrics());
    setUserSnitchReports(wiretapService.getUserSnitchReports(currentPlayer.id));
    setProposedBets(wiretapService.getProposedBets('pending_commish_approval'));
    setRemainingSnitches(wiretapService.getRemainingSnitchReports(currentPlayer.id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-board-navy w-full max-w-6xl h-[90vh] rounded-lg shadow-2xl overflow-hidden border-2 border-board-red relative">
        {/* Scanning animation overlay */}
        <div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-board-red to-transparent opacity-50 transition-all duration-50"
          style={{ transform: `translateY(${scanningAnimation * 8}px)` }}
        />

        {/* Header */}
        <div className="bg-gradient-to-r from-board-navy via-gray-900 to-board-navy p-6 border-b-2 border-board-red">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-['Archivo_Black'] italic text-board-red mb-2">
                👁️ THE WIRETAP
              </h2>
              <p className="text-gray-400">Live AI Surveillance • Commish Processing</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-board-red text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-2 rounded-t font-bold ${
                activeTab === 'feed'
                  ? 'bg-board-red text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              📡 LIVE FEED
            </button>
            <button
              onClick={() => setActiveTab('snitch')}
              className={`px-6 py-2 rounded-t font-bold ${
                activeTab === 'snitch'
                  ? 'bg-board-red text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              🚨 SNITCH WIRE ({remainingSnitches} left)
            </button>
            <button
              onClick={() => setActiveTab('proposed')}
              className={`px-6 py-2 rounded-t font-bold ${
                activeTab === 'proposed'
                  ? 'bg-board-red text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              ⚖️ PROPOSED BETS ({proposedBets.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-200px)] overflow-y-auto p-6">
          {activeTab === 'feed' && (
            <LiveFeedTab messages={recentMessages} metrics={activityMetrics} />
          )}
          {activeTab === 'snitch' && (
            <SnitchWireTab
              currentPlayer={currentPlayer}
              allPlayers={allPlayers}
              userReports={userSnitchReports}
              remainingSnitches={remainingSnitches}
              onRefresh={refreshData}
            />
          )}
          {activeTab === 'proposed' && (
            <ProposedBetsTab proposedBets={proposedBets} />
          )}
        </div>
      </div>
    </div>
  );
};

// Live Feed Tab Component
const LiveFeedTab: React.FC<{
  messages: ChatMessage[];
  metrics: WiretapActivityMetrics[];
}> = ({ messages, metrics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Heat Map */}
      <div className="lg:col-span-1">
        <h3 className="text-xl font-bold text-board-red mb-4 flex items-center gap-2">
          🔥 HEAT MAP
          <span className="text-sm text-gray-400">(Top Targets)</span>
        </h3>
        <div className="space-y-3">
          {metrics.slice(0, 5).map((metric, index) => (
            <div
              key={metric.userId}
              className={`p-4 rounded-lg border-2 ${
                metric.isHeatingUp
                  ? 'bg-board-red bg-opacity-10 border-board-red animate-pulse'
                  : 'bg-gray-800 border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">
                  {index === 0 && '🥇 '}
                  {index === 1 && '🥈 '}
                  {index === 2 && '🥉 '}
                  {metric.username}
                </span>
                {metric.isHeatingUp && (
                  <span className="text-board-red text-xl animate-bounce">🔥</span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                <div>Messages: {metric.messageCount}</div>
                <div>Controversy: {metric.controversyScore}/100</div>
              </div>
              <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-board-red transition-all duration-500"
                  style={{ width: `${metric.controversyScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="lg:col-span-2">
        <h3 className="text-xl font-bold text-board-red mb-4">
          📡 LIVE ACTIVITY STREAM
        </h3>
        <div className="space-y-2 opacity-60">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className="bg-gray-800 bg-opacity-50 p-3 rounded border border-gray-700 hover:bg-opacity-70 transition-all"
              style={{ 
                animation: `fadeIn 0.5s ease-in-out ${index * 0.05}s backwards`
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-300">{msg.username}</span>
                <span className="text-xs text-gray-500">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {msg.text || '[Image Message]'}
              </div>
              {msg.imageUrl && (
                <div className="mt-2 text-xs text-gray-500">
                  📷 Screenshot attached
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Snitch Wire Tab Component
const SnitchWireTab: React.FC<{
  currentPlayer: PlayerState;
  allPlayers: PlayerState[];
  userReports: SnitchReport[];
  remainingSnitches: number;
  onRefresh: () => void;
}> = ({ currentPlayer, allPlayers, userReports, remainingSnitches, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'sports' | 'delusion' | 'romance' | 'social' | 'behavior'>('social');
  const [suggestedDescription, setSuggestedDescription] = useState('');
  const [mockMessage, setMockMessage] = useState('');
  const [mockUser, setMockUser] = useState(allPlayers[0]?.id || '');

  const handleSubmitSnitch = () => {
    if (!mockMessage || !suggestedDescription) {
      alert('Please fill in all fields');
      return;
    }

    const selectedPlayer = allPlayers.find(p => p.id === mockUser);
    if (!selectedPlayer) return;

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: selectedPlayer.id,
      username: selectedPlayer.name,
      text: mockMessage,
      timestamp: new Date(),
    };

    const result = wiretapService.submitSnitchReport(
      currentPlayer.id,
      currentPlayer.name,
      chatMessage,
      selectedCategory,
      suggestedDescription
    );

    if (result.success) {
      alert('Snitch Report submitted! The Commish is investigating...');
      setShowForm(false);
      setMockMessage('');
      setSuggestedDescription('');
      setTimeout(onRefresh, 2500); // Refresh after investigation delay
    } else {
      alert(result.error);
    }
  };

  return (
    <div>
      {/* Submit Button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-board-red">🚨 SNITCH WIRE</h3>
          <p className="text-gray-400 text-sm mt-1">
            Flag messages for Shadow Lock bets • Earn Finder's Fee on approved reports
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={remainingSnitches === 0}
          className={`px-6 py-3 rounded-lg font-bold ${
            remainingSnitches > 0
              ? 'bg-board-red hover:bg-red-600 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          + NEW SNITCH ({remainingSnitches} left this week)
        </button>
      </div>

      {/* Snitch Form */}
      {showForm && (
        <div className="bg-board-crimson bg-opacity-20 border-2 border-board-crimson rounded-lg p-6 mb-6">
          <h4 className="text-xl font-bold text-board-red mb-4">📋 PENDING INVESTIGATION</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Target User</label>
              <select
                value={mockUser}
                onChange={(e) => setMockUser(e.target.value)}
                className="w-full bg-gray-800 text-white p-3 rounded border-2 border-gray-700 focus:border-board-red outline-none"
              >
                {allPlayers.map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Message Text (Demo)</label>
              <textarea
                value={mockMessage}
                onChange={(e) => setMockMessage(e.target.value)}
                placeholder="e.g., 'Ravens are winning the Super Bowl this year'"
                className="w-full bg-gray-800 text-white p-3 rounded border-2 border-gray-700 focus:border-board-red outline-none h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Category</label>
              <div className="flex gap-2 flex-wrap">
                {(['sports', 'delusion', 'romance', 'social', 'behavior'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded font-bold ${
                      selectedCategory === cat
                        ? 'bg-board-red text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Suggested Bet Description</label>
              <input
                type="text"
                value={suggestedDescription}
                onChange={(e) => setSuggestedDescription(e.target.value)}
                placeholder="e.g., 'mention the Ravens 3x today'"
                className="w-full bg-gray-800 text-white p-3 rounded border-2 border-gray-700 focus:border-board-red outline-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmitSnitch}
                className="flex-1 bg-board-red hover:bg-red-600 text-white font-bold py-3 rounded-lg"
              >
                🚨 SUBMIT SNITCH REPORT
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User's Snitch Reports */}
      <div>
        <h4 className="text-lg font-bold text-gray-300 mb-4">Your Snitch Reports</h4>
        {userReports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No snitch reports yet. Flag suspicious messages to earn Finder's Fees!
          </div>
        ) : (
          <div className="space-y-3">
            {userReports.map(report => (
              <div
                key={report.id}
                className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{report.message.username}</span>
                  <span className={`px-3 py-1 rounded text-sm font-bold ${
                    report.status === 'pending' ? 'bg-yellow-600 text-white' :
                    report.status === 'approved' ? 'bg-green-600 text-white' :
                    report.status === 'converted_to_bet' ? 'bg-board-red text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {report.status === 'pending' && '⏳ PENDING INVESTIGATION'}
                    {report.status === 'approved' && '✅ APPROVED'}
                    {report.status === 'converted_to_bet' && '🎯 POSTED TO BOARD'}
                    {report.status === 'rejected' && '❌ REJECTED'}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  {report.message.text}
                </div>
                <div className="text-sm text-gray-500">
                  Suggested: "{report.suggestedDescription}"
                </div>
                {report.findersFeePaid && (
                  <div className="mt-2 text-green-400 font-bold">
                    💰 Finder's Fee: +{report.findersFeePaid} GRIT
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Proposed Bets Tab Component
const ProposedBetsTab: React.FC<{
  proposedBets: AIProposedBet[];
}> = ({ proposedBets }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold text-board-red mb-4">⚖️ AI-PROPOSED SHADOW LOCKS</h3>
      <p className="text-gray-400 mb-6">
        The Commish has analyzed surveillance logs and proposed these bets for The Board
      </p>

      {proposedBets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No proposed bets pending Commish approval
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposedBets.map(bet => (
            <div
              key={bet.id}
              className="bg-gray-800 border-2 border-yellow-600 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-yellow-400 font-bold">🎯 {bet.category.toUpperCase()}</span>
                <span className="text-gray-400 text-sm">
                  Confidence: {bet.confidence}%
                </span>
              </div>

              <h4 className="text-xl font-bold text-white mb-2">
                Target: {bet.targetUsername}
              </h4>

              <div className="text-gray-300 mb-3">
                {bet.description}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-['Courier_New'] font-bold text-board-red">
                  {bet.odds > 0 ? '+' : ''}{bet.odds}
                </span>
                <span className="text-sm text-gray-500">
                  {bet.evidenceMessages.length} evidence messages
                </span>
              </div>

              <div className="text-xs text-gray-500">
                Awaiting Commish Approval • Created {bet.createdAt.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
