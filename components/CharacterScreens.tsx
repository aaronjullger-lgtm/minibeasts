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
    <div className="min-h-screen flex items-center justify-center text-center p-4">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-graduate">MINI BEASTS</h1>
        <h2 className="text-5xl md:text-6xl font-bold text-blue-500 mb-8 font-graduate">THE FANTASY LEAGUE</h2>
        
        <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg p-4 space-y-4 shadow-xl border-4 border-gray-700 mb-8">
          {messages.slice(0, step + 1).map((msg, i) => (
            <div key={i} className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-600 flex items-center justify-center text-white font-bold">
                  {speakers[msg.speaker]}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-gray-400 text-sm font-semibold">
                    {msg.displayName}
                  </span>
                  <div className="px-4 py-2 rounded-lg bg-gray-700 text-left">
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {step < messages.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl font-graduate">Next</button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {onContinue && (
                <button onClick={onContinue} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl font-graduate animate-pulse">Continue Season</button>
            )}
            <button onClick={onStart} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl font-graduate">{onContinue ? "Start New" : "Join the Chat"}</button>
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
        <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold font-graduate mb-1">{name}</h2>
            <h3 className="text-2xl text-gray-200 mb-3">{title}</h3>
            <p className="text-md text-gray-300 italic">"{description}"</p>
            {clique && <p className="text-sm text-blue-400 font-semibold mt-2">{clique}</p>}
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
    <button onClick={onClick} className="bg-gray-800/50 hover:bg-gray-700/70 text-white font-bold p-4 rounded-full transition-transform transform hover:scale-110 absolute top-1/2 -translate-y-1/2 z-10" style={direction === 'left' ? { left: '-20px' } : { right: '-20px' }}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {direction === 'left' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 font-graduate">Choose Your Mini Beast</h1>
      
      <div className="w-full max-w-3xl mx-auto relative flex items-center justify-center">
        <NavButton direction="left" onClick={handlePrev} />
        
        <div key={focusedChar.id} className="w-full max-w-2xl bg-gray-800/50 rounded-2xl p-6 shadow-lg border-2 border-gray-700 flex flex-col md:flex-row items-center gap-6 min-h-[220px] message-bubble">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex-shrink-0 border-4 border-blue-500 bg-gray-900 relative">
                <MiniBeastIcon characterId={focusedChar.id} isTalking={false} />
            </div>
            <BioDisplay character={focusedChar} />
        </div>
        
        <NavButton direction="right" onClick={handleNext} />
      </div>

      <div className="text-center mt-12">
          <button onClick={() => onSelect(focusedChar)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-lg text-2xl font-graduate transition transform hover:scale-105">
              Select {focusedChar.name}
          </button>
      </div>
    </div>
  );
};


export const EndScreen: React.FC<{ report: EndGameReport; onRestart: () => void; onContinue: () => void; }> = ({ report, onRestart, onContinue }) => (
  <div className="min-h-screen flex items-center justify-center text-center p-4 transition-opacity duration-500">
    <div>
      <h1 className="text-4xl md:text-6xl font-bold text-blue-500 mb-6 font-graduate">{report.title}</h1>
      <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12">{report.message}</p>
      {report.isEnd ? (
        <button onClick={onRestart} className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-2xl text-2xl transition duration-300 transform hover:scale-105 shadow-lg font-graduate">Start Over</button>
      ) : (
        <button onClick={onContinue} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl text-2xl transition duration-300 transform hover:scale-105 shadow-lg font-graduate">Start Next Season</button>
      )}
    </div>
  </div>
);