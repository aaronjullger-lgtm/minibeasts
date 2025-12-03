import React from 'react';
import { CharacterData, EndGameReport } from '../types';
import { characterData, characterIntroLines } from '../constants';
import { MiniBeastIcon, Spinner } from './ChatUI';

export const IntroScreen: React.FC<{ onStart: () => void; onContinue?: () => void }> = ({ onStart, onContinue }) => {
  const [step, setStep] = React.useState(0);
  const messages = [
    { speaker: 'spencer', text: "Alright, I made the group chat for the league.", displayName: 'Spencer' },
    { speaker: 'eric', text: 'why are there 18 people in here', displayName: 'Eric' },
    { speaker: 'colin', text: 'this is gonna be a disaster', displayName: 'Colin' }
  ];

  const speakers: { [key: string]: React.ReactNode } = {
      spencer: <MiniBeastIcon characterId='spencer' isTalking={false}/>,
      eric: <MiniBeastIcon characterId='eric' isTalking={false}/>,
      colin: <MiniBeastIcon characterId='colin' isTalking={false}/>
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-center p-4 bg-particles relative">
      <div className="relative z-10">
        <div className="mb-8 animate-[slide-in-right_0.8s_ease-out]">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 font-orbitron bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
            MINI BEASTS
          </h1>
          <h2 className="text-6xl md:text-8xl font-bold mb-8 font-orbitron bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient neon-blue" style={{textShadow: '0 0 30px rgba(59, 130, 246, 0.5)'}}>
            THE FANTASY LEAGUE
          </h2>
        </div>
        
        <div className="w-full max-w-md mx-auto glass rounded-2xl p-6 space-y-4 shadow-2xl border-2 border-blue-500/30 mb-8 animate-[pop-in_0.5s_ease-out_0.3s_both]">
          {messages.slice(0, step + 1).map((msg, i) => (
            <div key={i} className="flex justify-start animate-[slide-in-left_0.3s_ease-out]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg neon-blue">
                  {speakers[msg.speaker]}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-blue-300 text-sm font-bold mb-1">
                    {msg.displayName}
                  </span>
                  <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm text-left border border-blue-500/20 shadow-lg">
                    <p className="text-white">{msg.text}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {step < messages.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} className="btn-modern bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-10 rounded-xl text-xl font-orbitron shadow-2xl neon-blue border border-blue-400/30">
            Next
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {onContinue && (
                <button onClick={onContinue} className="btn-modern bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-10 rounded-xl text-xl font-orbitron pulse-glow shadow-2xl border border-green-400/30">
                  Continue Season
                </button>
            )}
            <button onClick={onStart} className="btn-modern bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-10 rounded-xl text-xl font-orbitron shadow-2xl neon-blue border border-blue-400/30">
              {onContinue ? "Start New" : "Join the Chat"}
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
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  const focusedChar = characters[currentIndex];

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % characters.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + characters.length) % characters.length);
  };
  
  const NavButton: React.FC<{ direction: 'left' | 'right', onClick: () => void }> = ({ direction, onClick }) => (
    <button onClick={onClick} className="btn-modern glass hover:bg-white/10 text-white font-bold p-5 rounded-full transition-transform transform hover:scale-125 absolute top-1/2 -translate-y-1/2 z-10 border-2 border-blue-500/30 neon-blue" style={direction === 'left' ? { left: '-20px' } : { right: '-20px' }}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        {direction === 'left' ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-particles relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-purple-500/5"></div>
      <h1 className="text-5xl md:text-7xl font-bold text-center mb-12 font-orbitron bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient relative z-10" style={{textShadow: '0 0 30px rgba(59, 130, 246, 0.5)'}}>
        Choose Your Mini Beast
      </h1>
      
      <div className="w-full max-w-3xl mx-auto relative flex items-center justify-center z-10">
        <NavButton direction="left" onClick={handlePrev} />
        
        <div key={focusedChar.id} className="w-full max-w-2xl glass rounded-3xl p-8 shadow-2xl border-2 border-blue-500/30 flex flex-col md:flex-row items-center gap-8 min-h-[280px] message-bubble neon-blue">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full flex-shrink-0 border-4 border-gradient-to-br from-blue-500 to-purple-600 bg-gradient-to-br from-gray-800 to-gray-900 relative shadow-2xl neon-purple p-1">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <MiniBeastIcon characterId={focusedChar.id} isTalking={false} />
                </div>
            </div>
            <BioDisplay character={focusedChar} />
        </div>
        
        <NavButton direction="right" onClick={handleNext} />
      </div>

      <div className="text-center mt-12 relative z-10">
          <button onClick={() => onSelect(focusedChar)} className="btn-modern bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-bold py-5 px-16 rounded-2xl text-3xl font-orbitron transition transform hover:scale-105 shadow-2xl neon-green border border-green-400/30">
              Select {focusedChar.name}
          </button>
      </div>
    </div>
  );
};


export const EndScreen: React.FC<{ report: EndGameReport; onRestart: () => void; onContinue: () => void; }> = ({ report, onRestart, onContinue }) => (
  <div className="min-h-screen flex items-center justify-center text-center p-4 transition-opacity duration-500 bg-particles relative">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-pink-500/10"></div>
    <div className="relative z-10">
      <h1 className="text-6xl md:text-8xl font-bold mb-8 font-orbitron bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient" style={{textShadow: '0 0 40px rgba(59, 130, 246, 0.6)'}}>{report.title}</h1>
      <div className="glass rounded-3xl p-8 max-w-3xl mx-auto mb-12 shadow-2xl border-2 border-blue-500/30 neon-blue">
        <p className="text-2xl md:text-3xl text-white font-semibold leading-relaxed">{report.message}</p>
      </div>
      {report.isEnd ? (
        <button onClick={onRestart} className="btn-modern bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold py-6 px-16 rounded-2xl text-3xl transition duration-300 transform hover:scale-105 shadow-2xl font-orbitron neon-pink border border-red-400/30">Start Over</button>
      ) : (
        <button onClick={onContinue} className="btn-modern bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-6 px-16 rounded-2xl text-3xl transition duration-300 transform hover:scale-105 shadow-2xl font-orbitron neon-blue border border-blue-400/30">Start Next Season</button>
      )}
    </div>
  </div>
);