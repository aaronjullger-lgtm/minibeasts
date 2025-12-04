import React from 'react';
import { CharacterData, EndGameReport } from '../types';
import { characterData, characterIntroLines } from '../constants';
import { MiniBeastIcon, Spinner } from './ChatUI';

export const IntroScreen: React.FC<{ onStart: () => void; onContinue?: () => void }> = ({ onStart, onContinue }) => {
  const [showIntro, setShowIntro] = React.useState(true);
  const [step, setStep] = React.useState(0);
  const [showTyping, setShowTyping] = React.useState(false);
  
  const messages = [
    { speaker: 'spencer', text: "yo i made the group chat", displayName: 'Spencer', time: '9:41 AM' },
    { speaker: 'eric', text: 'why are there 18 people in here lmao', displayName: 'Eric', time: '9:42 AM' },
    { speaker: 'colin', text: 'this is about to be chaos', displayName: 'Colin', time: '9:43 AM' },
    { speaker: 'justin', text: 'already screenshotting everything 📸', displayName: 'Justin', time: '9:43 AM' },
    { speaker: 'elie', text: "i'm the main character of this group", displayName: 'Elie', time: '9:44 AM' }
  ];

  React.useEffect(() => {
    if (step < messages.length - 1) {
      setShowTyping(true);
      const typingTimer = setTimeout(() => {
        setShowTyping(false);
      }, 800);
      return () => clearTimeout(typingTimer);
    }
  }, [step]);

  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col bg-imessage-dark">
        {/* iOS Status Bar */}
        <div className="ios-status-bar safe-top">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
            <span>100%</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-lg">
            {/* Game Logo/Title */}
            <div className="text-center mb-8" style={{animation: 'slide-up 0.6s ease-out'}}>
              <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">mini beasts</h1>
              <div className="inline-block ios-glass rounded-full px-6 py-2 mb-6">
                <p className="text-blue-400 text-sm font-semibold">A Fantasy Football Life Simulator</p>
              </div>
            </div>

            {/* Game Description */}
            <div className="ios-glass rounded-3xl p-6 mb-6 border border-blue-500/20" style={{animation: 'slide-up 0.7s ease-out'}}>
              <div className="text-center mb-4">
                <span className="text-3xl">🏈</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-3 text-center">Welcome to the Group Chat</h2>
              <p className="text-white/80 text-base leading-relaxed mb-3">
                Join an online fantasy football group chat with 18 unique personalities. Navigate friendships, rivalries, and the chaos of a full NFL season.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xl mb-1">💬</div>
                  <div className="text-white/90 text-sm font-medium">Group Chat</div>
                  <div className="text-white/60 text-xs">Dynamic conversations</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xl mb-1">📊</div>
                  <div className="text-white/90 text-sm font-medium">Manage Stats</div>
                  <div className="text-white/60 text-xs">Balance your life</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xl mb-1">🎯</div>
                  <div className="text-white/90 text-sm font-medium">Make Choices</div>
                  <div className="text-white/60 text-xs">Shape your story</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xl mb-1">🏆</div>
                  <div className="text-white/90 text-sm font-medium">Win It All</div>
                  <div className="text-white/60 text-xs">Survive the season</div>
                </div>
              </div>
            </div>

            {/* Character Preview */}
            <div className="text-center mb-6" style={{animation: 'slide-up 0.8s ease-out'}}>
              <p className="text-white/60 text-sm mb-3">Choose from 18 characters</p>
              <div className="flex justify-center gap-2">
                {['pace', 'eric', 'colin', 'justin', 'elie', 'aaron'].map((id) => (
                  <div key={id} className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 hover:border-blue-500 transition-all">
                    <MiniBeastIcon characterId={id} isTalking={false} />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3" style={{animation: 'slide-up 0.9s ease-out'}}>
              {onContinue && (
                <button 
                  onClick={onContinue} 
                  className="ios-button w-full haptic-press"
                  style={{background: '#34C759', fontSize: '18px', padding: '16px 24px'}}
                >
                  Continue Season
                </button>
              )}
              <button 
                onClick={() => {
                  setShowIntro(false);
                  // Don't call onStart here, let it proceed to the chat intro
                }} 
                className="ios-button w-full haptic-press"
                style={{fontSize: '18px', padding: '16px 24px'}}
              >
                {onContinue ? "Start New Game" : "Start Game"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-imessage-dark">
      {/* iOS Status Bar */}
      <div className="ios-status-bar safe-top">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
          </svg>
          <span>100%</span>
        </div>
      </div>

      {/* iMessage Header */}
      <div className="group-chat-header safe-top">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-0.5">
              {['spencer', 'eric', 'colin', 'justin'].map((id, i) => (
                <div key={id} className="w-7 h-7 rounded-full overflow-hidden border border-white/20" style={{marginLeft: i > 0 ? '-8px' : '0', zIndex: 4 - i}}>
                  <MiniBeastIcon characterId={id} isTalking={false} />
                </div>
              ))}
            </div>
            <span className="text-white font-semibold text-sm">mini beasts</span>
            <span className="text-white/50 text-xs">{messages.length} members</span>
          </div>
          <div className="flex-1 flex justify-end">
            <button className="w-8 h-8 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 ios-scrollbar">
        {/* Group creation notice */}
        <div className="flex justify-center mb-6">
          <div className="text-center">
            <div className="text-white/50 text-xs mb-2">Today 9:41 AM</div>
            <div className="ios-glass rounded-full px-4 py-2 text-sm text-white/70">
              <span className="font-semibold">Spencer</span> named the group <span className="font-semibold">"mini beasts"</span>
            </div>
          </div>
        </div>

        {messages.slice(0, step + 1).map((msg, i) => (
          <div key={i} className="flex items-end gap-2 message-bubble">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
              <MiniBeastIcon characterId={msg.speaker} isTalking={false} />
            </div>
            <div className="flex flex-col">
              <span className="text-white/60 text-xs font-medium ml-3 mb-1">{msg.displayName}</span>
              <div className="imessage-bubble imessage-gray">
                {msg.text}
              </div>
              <span className="message-time ml-3">{msg.time}</span>
            </div>
          </div>
        ))}

        {showTyping && step < messages.length - 1 && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
              <MiniBeastIcon characterId={messages[step + 1].speaker} isTalking={true} />
            </div>
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="ios-glass border-t border-white/10 p-4 safe-bottom">
        {step < messages.length - 1 ? (
          <button 
            onClick={() => setStep(s => s + 1)} 
            className="ios-button w-full haptic-press"
          >
            Continue
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            {onContinue && (
              <button 
                onClick={onContinue} 
                className="ios-button w-full haptic-press"
                style={{background: '#34C759'}}
              >
                Continue Season
              </button>
            )}
            <button 
              onClick={onStart} 
              className="ios-button w-full haptic-press"
            >
              {onContinue ? "Start New Game" : "Join the Group"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const BioDisplay: React.FC<{ character: CharacterData }> = ({ character }) => {
    const { name, bio } = character;
    const parts = bio.split('\n');
    const title = parts[0] || '';
    const description = parts[1] || '';
    const clique = parts[2] || '';

    return (
        <div className="text-center md:text-left flex-1">
            <h2 className="text-5xl font-bold font-orbitron mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{name}</h2>
            <h3 className="text-2xl text-cyan-300 mb-4 font-semibold">{title}</h3>
            <p className="text-lg text-gray-200 italic leading-relaxed">"{description}"</p>
            {clique && <p className="text-md text-blue-400 font-bold mt-3 px-4 py-2 bg-blue-500/20 rounded-full inline-block border border-blue-400/30">{clique}</p>}
        </div>
    );
};

export const CharacterSelectScreen: React.FC<{ onSelect: (char: CharacterData) => void }> = ({ onSelect }) => {
  const characters = Object.values(characterData);
  const [selectedChar, setSelectedChar] = React.useState<CharacterData | null>(null);

  const handleSelect = (char: CharacterData) => {
    setSelectedChar(char);
  };

  const handleConfirm = () => {
    if (selectedChar) {
      onSelect(selectedChar);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-imessage-dark">
      {/* iOS Status Bar */}
      <div className="ios-status-bar safe-top">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
          </svg>
          <span>100%</span>
        </div>
      </div>

      {/* Header with Character Info */}
      <div className="group-chat-header safe-top" style={{paddingBottom: '12px'}}>
        <div className="text-center">
          <h1 className="text-white font-semibold text-lg">Choose Your Character</h1>
          <p className="text-white/60 text-sm">Who are you in the group?</p>
        </div>
      </div>

      {/* Selected Character Details - Fixed at Top */}
      {selectedChar && (
        <div className="px-4 pt-3 pb-4 bg-imessage-dark border-b border-white/10">
          <div className="ios-glass rounded-2xl p-4 border border-blue-500/30" style={{animation: 'message-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 flex-shrink-0">
                <MiniBeastIcon characterId={selectedChar.id} isTalking={false} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg mb-1">{selectedChar.name}</h3>
                {selectedChar.bio.split('\n').map((line, i) => (
                  <p key={i} className="text-white/70 text-sm mb-1">{line}</p>
                ))}
              </div>
            </div>
            <button 
              onClick={handleConfirm}
              className="ios-button w-full haptic-press mt-4"
              style={{padding: '12px 24px'}}
            >
              Play as {selectedChar.name} →
            </button>
          </div>
        </div>
      )}

      {/* Character Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4 ios-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {characters.map((char) => {
            const bio = char.bio.split('\n');
            const isSelected = selectedChar?.id === char.id;
            
            return (
              <button
                key={char.id}
                onClick={() => handleSelect(char)}
                className={`ios-glass rounded-2xl p-4 flex flex-col items-center gap-3 transition-all haptic-press relative ${
                  isSelected 
                    ? 'border-2 border-blue-500 bg-blue-500/20' 
                    : 'border border-white/10 hover:border-white/30'
                }`}
                style={{animation: 'slide-up 0.3s ease-out'}}
              >
                <div className={`w-20 h-20 rounded-full overflow-hidden border-2 transition-all ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-white/20'
                }`}>
                  <MiniBeastIcon characterId={char.id} isTalking={false} />
                </div>
                <div className="text-center">
                  <div className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                    {char.name}
                  </div>
                  <div className="text-white/60 text-xs line-clamp-2">{bio[0]}</div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Instruction or Fallback Button */}
      {!selectedChar && (
        <div className="ios-glass border-t border-white/10 p-4 safe-bottom text-center">
          <p className="text-white/60 text-sm">Tap a character to view details and start playing</p>
        </div>
      )}
    </div>
  );
};


export const EndScreen: React.FC<{ report: EndGameReport; onRestart: () => void; onContinue: () => void; }> = ({ report, onRestart, onContinue }) => (
  <div className="min-h-screen flex flex-col bg-imessage-dark">
    {/* iOS Status Bar */}
    <div className="ios-status-bar safe-top">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
        </svg>
        <span>100%</span>
      </div>
    </div>

    {/* Header */}
    <div className="group-chat-header safe-top">
      <div className="text-center">
        <h1 className="text-white font-semibold text-lg">mini beasts</h1>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Season End Message */}
        <div className="ios-glass rounded-3xl p-8 mb-6 text-center border border-blue-500/30" style={{animation: 'message-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}>
          <div className="text-4xl mb-4">
            {report.isEnd ? '🏆' : '📊'}
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{report.title}</h2>
          <p className="text-white/80 text-lg leading-relaxed">{report.message}</p>
        </div>

        {/* System message style */}
        <div className="flex justify-center mb-6">
          <div className="ios-glass rounded-full px-4 py-2 text-sm text-white/70 text-center">
            {report.isEnd ? 'Season Complete' : 'End of Week'}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {report.isEnd ? (
            <button 
              onClick={onRestart} 
              className="ios-button w-full haptic-press"
              style={{background: '#FF3B30'}}
            >
              Start New Season
            </button>
          ) : (
            <button 
              onClick={onContinue} 
              className="ios-button w-full haptic-press"
            >
              Continue to Next Week
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);